'use client'

import { useState } from 'react'
import { Sidebar, type ModuleDef } from '@/components/sidebar'
import { useStore } from '@/components/store'
import { Button } from '@/components/ui/button'
import type { DemoAccount } from '@/lib/data'
import { DashboardModule } from '@/components/modules/dashboard'
import { RegistrationModule } from '@/components/modules/registration'
import { VisitsModule } from '@/components/modules/visits'
import { PoliklinikModule } from '@/components/modules/poliklinik'
import { PharmacyModule } from '@/components/modules/pharmacy'
import { CashierModule } from '@/components/modules/cashier'
import { SatuSehatModule } from '@/components/modules/satu-sehat'
import {
  Activity,
  ClipboardPlus,
  LogOut,
  LayoutDashboard,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Wallet,
} from 'lucide-react'

const META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Ringkasan operasional rumah sakit' },
  registrasi: { title: 'Registrasi', subtitle: 'Pendaftaran & data pasien' },
  kunjungan: { title: 'Kunjungan', subtitle: 'Pembuatan encounter rawat jalan' },
  poliklinik: { title: 'Poliklinik', subtitle: 'Pemeriksaan dokter, diagnosis & resep' },
  farmasi: { title: 'Farmasi', subtitle: 'Penyerahan obat & stok' },
  kasir: { title: 'Kasir', subtitle: 'Pembayaran & penyelesaian kunjungan' },
  satusehat: { title: 'Satu Sehat', subtitle: 'Integrasi FHIR R4 (mock Kemenkes)' },
}

export function Shell({ user, onLogout }: { user: DemoAccount; onLogout: () => void }) {
  const { doctorQueue, pharmacyQueue, cashierQueue } = useStore()
  const [active, setActive] = useState('dashboard')

  const modules: ModuleDef[] = [
    { key: 'dashboard', label: 'Dashboard', sublabel: '', icon: LayoutDashboard },
    { key: 'registrasi', label: 'Registrasi', sublabel: '', icon: UserPlus },
    { key: 'kunjungan', label: 'Kunjungan', sublabel: '', icon: ClipboardPlus },
    {
      key: 'poliklinik',
      label: 'Poliklinik',
      sublabel: '',
      icon: Stethoscope,
      badge: doctorQueue.length,
    },
    { key: 'farmasi', label: 'Farmasi', sublabel: '', icon: Pill, badge: pharmacyQueue.length },
    { key: 'kasir', label: 'Kasir', sublabel: '', icon: Wallet, badge: cashierQueue.length },
    { key: 'satusehat', label: 'Satu Sehat', sublabel: '', icon: ShieldCheck },
  ]

  const meta = META[active]

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar modules={modules} active={active} onSelect={setActive} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground text-balance">{meta.title}</h1>
            <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
              <Activity className="size-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground">Arogya</span>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">{user.name}</p>
              <p className="text-xs leading-tight text-muted-foreground">{user.role}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label="Keluar" title="Keluar">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {active === 'dashboard' && <DashboardModule />}
          {active === 'registrasi' && <RegistrationModule />}
          {active === 'kunjungan' && <VisitsModule />}
          {active === 'poliklinik' && <PoliklinikModule />}
          {active === 'farmasi' && <PharmacyModule />}
          {active === 'kasir' && <CashierModule />}
          {active === 'satusehat' && <SatuSehatModule />}
        </main>
      </div>
    </div>
  )
}
