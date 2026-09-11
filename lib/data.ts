import type { Drug, Icd10 } from './types'

export const CONSULTATION_FEE = 50000

export const INITIAL_DRUGS: Drug[] = [
  { id: 'drg-paracetamol', name: 'Paracetamol 500mg', price: 3000, stock: 240, unit: 'tablet' },
  { id: 'drg-amoxicillin', name: 'Amoxicillin 500mg', price: 5000, stock: 160, unit: 'kapsul' },
  { id: 'drg-omeprazole', name: 'Omeprazole 20mg', price: 6500, stock: 120, unit: 'kapsul' },
  { id: 'drg-amlodipine', name: 'Amlodipine 10mg', price: 4500, stock: 140, unit: 'tablet' },
  { id: 'drg-metformin', name: 'Metformin 500mg', price: 4000, stock: 180, unit: 'tablet' },
  { id: 'drg-oralit', name: 'Oralit', price: 2500, stock: 200, unit: 'sachet' },
  { id: 'drg-salbutamol', name: 'Salbutamol 2mg', price: 5500, stock: 90, unit: 'tablet' },
]

export const ICD10_CODES: Icd10[] = [
  { code: 'J06.9', display: 'Infeksi saluran napas atas akut, tidak spesifik' },
  { code: 'I10', display: 'Hipertensi esensial (primer)' },
  { code: 'E11.9', display: 'Diabetes melitus tipe 2 tanpa komplikasi' },
  { code: 'K29.7', display: 'Gastritis, tidak spesifik' },
  { code: 'A09', display: 'Diare dan gastroenteritis infeksi' },
  { code: 'R51', display: 'Nyeri kepala (sefalgia)' },
  { code: 'M54.5', display: 'Nyeri punggung bawah (low back pain)' },
  { code: 'J45.9', display: 'Asma, tidak spesifik' },
]

// Akun contoh untuk login (mock, hanya untuk demo tugas)
export interface DemoAccount {
  username: string
  password: string
  name: string
  role: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { username: 'admin', password: 'admin', name: 'Admin Utama', role: 'Administrator' },
  { username: 'dokter', password: 'dokter', name: 'dr. Andini, Sp.PD', role: 'Dokter' },
  { username: 'farmasi', password: 'farmasi', name: 'Rina (Apoteker)', role: 'Farmasi' },
  { username: 'kasir', password: 'kasir', name: 'Sari (Kasir)', role: 'Kasir' },
]
