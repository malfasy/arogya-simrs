import type { Drug, Icd10, LabTestDef, Role } from './types'

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

export const LAB_TESTS: LabTestDef[] = [
  { id: 'lab-cbc', name: 'Darah Lengkap (CBC)', category: 'Laboratorium', price: 45000, loincCode: '58410-2' },
  { id: 'lab-gluc', name: 'Gula Darah Sewaktu', category: 'Laboratorium', price: 25000, loincCode: '2339-0' },
  { id: 'lab-lipid', name: 'Profil Lipid', category: 'Laboratorium', price: 90000, loincCode: '57698-3' },
  { id: 'lab-urine', name: 'Urinalisis Lengkap', category: 'Laboratorium', price: 35000, loincCode: '24357-6' },
  { id: 'lab-liver', name: 'Fungsi Hati (SGOT/SGPT)', category: 'Laboratorium', price: 70000, loincCode: '24325-3' },
  { id: 'rad-xray', name: 'Rontgen Thorax (X-Ray)', category: 'Radiologi', price: 120000, loincCode: '36643-5' },
  { id: 'rad-usg', name: 'USG Abdomen', category: 'Radiologi', price: 180000, loincCode: '24558-9' },
  { id: 'rad-ct', name: 'CT Scan Kepala', category: 'Radiologi', price: 850000, loincCode: '24725-4' },
  { id: 'rad-mri', name: 'MRI Kepala', category: 'Radiologi', price: 1500000, loincCode: '24590-2' },
]

// Akun contoh untuk login (mock, hanya untuk demo tugas)
export interface DemoAccount {
  username: string
  password: string
  name: string
  role: string
  roleKey: Role
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { username: 'admin', password: 'admin', name: 'Admin Utama', role: 'Administrator', roleKey: 'admin' },
  { username: 'dokter', password: 'dokter', name: 'dr. Andini, Sp.PD', role: 'Dokter', roleKey: 'dokter' },
  { username: 'farmasi', password: 'farmasi', name: 'Rina (Apoteker)', role: 'Farmasi', roleKey: 'farmasi' },
  { username: 'kasir', password: 'kasir', name: 'Sari (Kasir)', role: 'Kasir', roleKey: 'kasir' },
]