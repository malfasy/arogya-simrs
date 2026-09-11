export type Gender = 'male' | 'female'

export type Role = 'admin' | 'dokter' | 'farmasi' | 'kasir'

export interface Patient {
  id: string
  mrn: string // nomor rekam medis
  nik: string
  name: string
  gender: Gender
  birthDate: string
  address: string
  phone: string
  satuSehatId?: string
  createdAt: number
}

export interface PrescriptionItem {
  drugId: string
  name: string
  price: number
  quantity: number
  unit: string
}

export interface Diagnosis {
  code: string
  display: string
}

export type VisitStage = 'doctor' | 'pharmacy' | 'cashier' | 'complete'

export interface Vitals {
  systolic?: string // tekanan darah sistolik (mmHg)
  diastolic?: string // tekanan darah diastolik (mmHg)
  temperature?: string // suhu (°C)
  heartRate?: string // nadi (bpm)
  respiratoryRate?: string // laju napas (x/menit)
  weight?: string // berat badan (kg)
  height?: string // tinggi badan (cm)
}

export type LabCategory = 'Laboratorium' | 'Radiologi'

export interface LabTestDef {
  id: string
  name: string
  category: LabCategory
  price: number
  loincCode?: string
}

export type LabOrderStatus = 'requested' | 'completed'

export interface LabOrder {
  id: string
  testId: string
  name: string
  category: LabCategory
  price: number
  loincCode?: string
  status: LabOrderStatus
  result?: string
  serviceRequestId?: string
  createdAt: number
  completedAt?: number
}

export interface Visit {
  id: string
  patientId: string
  complaint: string
  stage: VisitStage
  encounterId?: string
  conditionId?: string
  diagnosis?: Diagnosis
  vitals?: Vitals
  clinicalNotes?: string
  labOrders: LabOrder[]
  prescription: PrescriptionItem[]
  consultationFee: number
  createdAt: number
  completedAt?: number
}

export interface Drug {
  id: string
  name: string
  price: number
  stock: number
  unit: string
}

export interface Icd10 {
  code: string
  display: string
}

export type FhirResourceType = 'OAuth2' | 'Patient' | 'Encounter' | 'Condition' | 'ServiceRequest'

export interface FhirLog {
  id: string
  timestamp: number
  resourceType: FhirResourceType
  method: string
  endpoint: string
  status: number
  request: unknown
  response: unknown
}