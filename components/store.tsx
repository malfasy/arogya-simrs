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
  Patient,
  PrescriptionItem,
  Visit,
} from '@/lib/types'
import { CONSULTATION_FEE, INITIAL_DRUGS } from '@/lib/data'
import { generateMrn, uid } from '@/lib/format'
import {
  buildConditionResource,
  buildEncounterResource,
  buildPatientResource,
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

  // derived
  getPatient: (id: string) => Patient | undefined
  revenue: number

  // actions
  registerPatient: (input: NewPatientInput) => Promise<Patient>
  createVisit: (patientId: string, complaint: string) => Promise<void>
  examinePatient: (
    visitId: string,
    diagnosis: Diagnosis,
    prescription: PrescriptionItem[],
  ) => Promise<void>
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
        prescription: [],
        consultationFee: CONSULTATION_FEE,
        createdAt: Date.now(),
      }
      setVisits((prev) => [...prev, visit])
    },
    [addLog, ensureToken, patients],
  )

  const examinePatient = useCallback(
    async (
      visitId: string,
      diagnosis: Diagnosis,
      prescription: PrescriptionItem[],
    ): Promise<void> => {
      const visit = visits.find((v) => v.id === visitId)
      if (!visit) return
      const patient = patients.find((p) => p.id === visit.patientId)
      if (!patient) return

      await ensureToken()
      const resource = buildConditionResource({
        patientSatuSehatId: patient.satuSehatId ?? patient.id,
        patientName: patient.name,
        encounterId: visit.encounterId ?? '',
        diagnosis,
      })
      const { endpoint, response, assignedId } = await postResource('Condition', resource)
      addLog({
        resourceType: 'Condition',
        method: 'POST',
        endpoint,
        status: 201,
        request: resource,
        response,
      })

      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId
            ? { ...v, diagnosis, prescription, conditionId: assignedId, stage: 'pharmacy' }
            : v,
        ),
      )
    },
    [addLog, ensureToken, patients, visits],
  )

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
    const revenue = visits
      .filter((v) => v.stage === 'complete')
      .reduce(
        (sum, v) =>
          sum +
          v.consultationFee +
          v.prescription.reduce((s, p) => s + p.price * p.quantity, 0),
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
      getPatient: (id: string) => patients.find((p) => p.id === id),
      revenue,
      registerPatient,
      createVisit,
      examinePatient,
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
