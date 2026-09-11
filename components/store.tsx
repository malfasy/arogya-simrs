'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Diagnosis,
  Drug,
  FhirLog,
  FhirResourceType,
  Gender,
  LabOrder,
  LabTestDef,
  Patient,
  PrescriptionItem,
  Visit,
  Vitals,
} from '@/lib/types'
import { CONSULTATION_FEE, INITIAL_DRUGS } from '@/lib/data'
import { generateMrn, uid } from '@/lib/format'
import {
  buildConditionResource,
  buildEncounterResource,
  buildPatientResource,
  buildServiceRequestResource,
  isTokenValid,
  postResource,
  requestOAuthToken,
  type MockToken,
} from '@/lib/satu-sehat'

export interface NewPatientInput {
  nik: string
  name: string
  gender: Gender
  birthDate: string
  address: string
  phone: string
}

export interface ExamInput {
  diagnosis: Diagnosis
  vitals: Vitals
  clinicalNotes: string
  prescription: PrescriptionItem[]
  labTests: LabTestDef[]
}

interface StoreValue {
  patients: Patient[]
  visits: Visit[]
  drugs: Drug[]
  logs: FhirLog[]
  token: MockToken | null

  // queues
  doctorQueue: Visit[]
  pharmacyQueue: Visit[]
  cashierQueue: Visit[]
  labQueue: Visit[]

  // derived
  getPatient: (id: string) => Patient | undefined
  revenue: number

  // actions
  registerPatient: (input: NewPatientInput) => Promise<Patient>
  createVisit: (patientId: string, complaint: string) => Promise<void>
  examinePatient: (visitId: string, input: ExamInput) => Promise<void>
  completeLabOrder: (visitId: string, orderId: string, result: string) => void
  dispenseMedicine: (visitId: string) => void
  receivePayment: (visitId: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [drugs, setDrugs] = useState<Drug[]>(INITIAL_DRUGS)
  const [logs, setLogs] = useState<FhirLog[]>([])
  const [token, setToken] = useState<MockToken | null>(null)

  const tokenRef = useRef<MockToken | null>(null)
  const mrnSeq = useRef(1)

  const addLog = useCallback(
    (entry: {
      resourceType: FhirResourceType
      method: string
      endpoint: string
      status: number
      request: unknown
      response: unknown
    }) => {
      setLogs((prev) => [
        {
          id: uid('log'),
          timestamp: Date.now(),
          ...entry,
        },
        ...prev,
      ])
    },
    [],
  )

  const ensureToken = useCallback(async (): Promise<MockToken> => {
    if (isTokenValid(tokenRef.current)) return tokenRef.current as MockToken
    const { request, response, endpoint } = await requestOAuthToken()
    tokenRef.current = response
    setToken(response)
    addLog({
      resourceType: 'OAuth2',
      method: 'POST',
      endpoint,
      status: 200,
      request,
      response,
    })
    return response
  }, [addLog])

  const registerPatient = useCallback(
    async (input: NewPatientInput): Promise<Patient> => {
      const patient: Patient = {
        id: uid('pat'),
        mrn: generateMrn(mrnSeq.current),
        nik: input.nik,
        name: input.name,
        gender: input.gender,
        birthDate: input.birthDate,
        address: input.address,
        phone: input.phone,
        createdAt: Date.now(),
      }
      mrnSeq.current += 1

      await ensureToken()
      const resource = buildPatientResource(patient)
      const { endpoint, response, assignedId } = await postResource('Patient', resource)
      patient.satuSehatId = assignedId
      addLog({
        resourceType: 'Patient',
        method: 'POST',
        endpoint,
        status: 201,
        request: resource,
        response,
      })

      setPatients((prev) => [...prev, patient])
      return patient
    },
    [addLog, ensureToken],
  )

  const createVisit = useCallback(
    async (patientId: string, complaint: string): Promise<void> => {
      const patient = patients.find((p) => p.id === patientId)
      if (!patient) return

      const visitId = uid('vis')
      await ensureToken()
      const resource = buildEncounterResource({
        patientSatuSehatId: patient.satuSehatId ?? patient.id,
        patientName: patient.name,
        complaint,
      })
      const { endpoint, response, assignedId } = await postResource('Encounter', resource)
      addLog({
        resourceType: 'Encounter',
        method: 'POST',
        endpoint,
        status: 201,
        request: resource,
        response,
      })

      const visit: Visit = {
        id: visitId,
        patientId,
        complaint,
        stage: 'doctor',
        encounterId: assignedId,
        labOrders: [],
        prescription: [],
        consultationFee: CONSULTATION_FEE,
        createdAt: Date.now(),
      }
      setVisits((prev) => [...prev, visit])
    },
    [addLog, ensureToken, patients],
  )

  const examinePatient = useCallback(
    async (visitId: string, input: ExamInput): Promise<void> => {
      const visit = visits.find((v) => v.id === visitId)
      if (!visit) return
      const patient = patients.find((p) => p.id === visit.patientId)
      if (!patient) return

      await ensureToken()

      // 1) Condition (diagnosis)
      const conditionResource = buildConditionResource({
        patientSatuSehatId: patient.satuSehatId ?? patient.id,
        patientName: patient.name,
        encounterId: visit.encounterId ?? '',
        diagnosis: input.diagnosis,
      })
      const cond = await postResource('Condition', conditionResource)
      addLog({
        resourceType: 'Condition',
        method: 'POST',
        endpoint: cond.endpoint,
        status: 201,
        request: conditionResource,
        response: cond.response,
      })

      // 2) One ServiceRequest per ordered lab/radiology test
      const labOrders: LabOrder[] = []
      for (const test of input.labTests) {
        const order: LabOrder = {
          id: uid('ord'),
          testId: test.id,
          name: test.name,
          category: test.category,
          price: test.price,
          loincCode: test.loincCode,
          status: 'requested',
          createdAt: Date.now(),
        }
        const srResource = buildServiceRequestResource({
          patientSatuSehatId: patient.satuSehatId ?? patient.id,
          patientName: patient.name,
          encounterId: visit.encounterId ?? '',
          order,
        })
        const sr = await postResource('ServiceRequest', srResource)
        order.serviceRequestId = sr.assignedId
        addLog({
          resourceType: 'ServiceRequest',
          method: 'POST',
          endpoint: sr.endpoint,
          status: 201,
          request: srResource,
          response: sr.response,
        })
        labOrders.push(order)
      }

      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? {
                ...v,
                diagnosis: input.diagnosis,
                vitals: input.vitals,
                clinicalNotes: input.clinicalNotes,
                prescription: input.prescription,
                labOrders,
                conditionId: cond.assignedId,
                stage: 'pharmacy',
              }
            : v,
        ),
      )
    },
    [addLog, ensureToken, patients, visits],
  )

  const completeLabOrder = useCallback((visitId: string, orderId: string, result: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              labOrders: v.labOrders.map((o) =>
                o.id === orderId
                  ? { ...o, status: 'completed', result, completedAt: Date.now() }
                  : o,
              ),
            }
          : v,
      ),
    )
  }, [])

  const dispenseMedicine = useCallback((visitId: string) => {
    setVisits((prevVisits) => {
      const visit = prevVisits.find((v) => v.id === visitId)
      if (visit) {
        setDrugs((prevDrugs) =>
          prevDrugs.map((d) => {
            const item = visit.prescription.find((p) => p.drugId === d.id)
            if (!item) return d
            return { ...d, stock: Math.max(0, d.stock - item.quantity) }
          }),
        )
      }
      return prevVisits.map((v) => (v.id === visitId ? { ...v, stage: 'cashier' } : v))
    })
  }, [])

  const receivePayment = useCallback((visitId: string) => {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId ? { ...v, stage: 'complete', completedAt: Date.now() } : v,
      ),
    )
  }, [])

  const value = useMemo<StoreValue>(() => {
    const doctorQueue = visits.filter((v) => v.stage === 'doctor')
    const pharmacyQueue = visits.filter((v) => v.stage === 'pharmacy')
    const cashierQueue = visits.filter((v) => v.stage === 'cashier')
    const labQueue = visits.filter((v) =>
      v.labOrders.some((o) => o.status === 'requested'),
    )
    const revenue = visits
      .filter((v) => v.stage === 'complete')
      .reduce(
        (sum, v) =>
          sum +
          v.consultationFee +
          v.prescription.reduce((s, p) => s + p.price * p.quantity, 0) +
          v.labOrders.reduce((s, o) => s + o.price, 0),
        0,
      )
    return {
      patients,
      visits,
      drugs,
      logs,
      token,
      doctorQueue,
      pharmacyQueue,
      cashierQueue,
      labQueue,
      getPatient: (id: string) => patients.find((p) => p.id === id),
      revenue,
      registerPatient,
      createVisit,
      examinePatient,
      completeLabOrder,
      dispenseMedicine,
      receivePayment,
    }
  }, [
    patients,
    visits,
    drugs,
    logs,
    token,
    registerPatient,
    createVisit,
    examinePatient,
    completeLabOrder,
    dispenseMedicine,
    receivePayment,
  ])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}