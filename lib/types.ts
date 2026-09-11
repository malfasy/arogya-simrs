export type Gender = 'male' | 'female'

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

export interface Visit {
  id: string
  patientId: string
  complaint: string
  stage: VisitStage
  encounterId?: string
  conditionId?: string
  diagnosis?: Diagnosis
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

export type FhirResourceType = 'OAuth2' | 'Patient' | 'Encounter' | 'Condition'

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
