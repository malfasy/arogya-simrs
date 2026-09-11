'use client'

import { Badge, Card, CardHeader, EmptyState, Stat } from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { VisitStepper } from '@/components/visit-stepper'
import { formatRupiah, formatTime } from '@/lib/format'
import { Activity, ClipboardList, ShieldCheck, Users, Wallet } from 'lucide-react'

export function DashboardModule() {
  const { patients, visits, logs, revenue, getPatient } = useStore()
  const completed = visits.filter((v) => v.stage === 'complete').length
  const recent = [...visits].reverse().slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total Pasien"
          value={patients.length}
          icon={<Users className="size-4.5 text-primary" />}
        />
        <Stat
          label="Total Kunjungan"
          value={visits.length}
          icon={<Activity className="size-4.5 text-success" />}
          tone="success"
        />
        <Stat
          label="Resource FHIR Terkirim"
          value={logs.length}
          icon={<ShieldCheck className="size-4.5 text-warning-foreground" />}
          tone="warning"
        />
        <Stat
          label="Total Pendapatan"
          value={formatRupiah(revenue)}
          icon={<Wallet className="size-4.5 text-primary" />}
        />
      </div>

      <Card>
        <CardHeader
          title="Kunjungan Terbaru"
          description={`${completed} dari ${visits.length} kunjungan selesai`}
          icon={<ClipboardList className="size-4.5" />}
        />
        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<ClipboardList className="size-6" />}
              title="Belum ada aktivitas"
              description="Mulai dengan mendaftarkan pasien di modul Registrasi."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((v) => {
              const p = getPatient(v.patientId)
              return (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-48">
                    <p className="font-medium text-foreground">{p?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono tabular-nums">{p?.mrn}</span> ·{' '}
                      {formatTime(v.createdAt)}
                      {v.diagnosis ? (
                        <>
                          {' · '}
                          <span className="font-mono">{v.diagnosis.code}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <VisitStepper stage={v.stage} />
                  {v.stage === 'complete' ? (
                    <Badge tone="success">Selesai</Badge>
                  ) : (
                    <Badge tone="primary">Berjalan</Badge>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
