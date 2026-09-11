'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Select,
  Textarea,
} from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { VisitStepper } from '@/components/visit-stepper'
import { formatTime } from '@/lib/format'
import { ClipboardPlus, Stethoscope } from 'lucide-react'

export function VisitsModule() {
  const { patients, visits, createVisit, getPatient } = useStore()
  const [patientId, setPatientId] = useState('')
  const [complaint, setComplaint] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!patientId) {
      setError('Pilih pasien terlebih dahulu.')
      return
    }
    if (!complaint.trim()) {
      setError('Keluhan utama wajib diisi.')
      return
    }
    setSaving(true)
    try {
      await createVisit(patientId, complaint.trim())
      setPatientId('')
      setComplaint('')
    } finally {
      setSaving(false)
    }
  }

  const activeVisits = [...visits].reverse()

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <Card>
        <CardHeader
          title="Buat Kunjungan Baru"
          description="Membuat FHIR Encounter (rawat jalan) untuk pasien."
          icon={<ClipboardPlus className="size-4.5" />}
        />
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <Field label="Pilih Pasien" htmlFor="patient">
            <Select id="patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">— Pilih pasien terdaftar —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.mrn} · {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Keluhan Utama" htmlFor="complaint">
            <Textarea
              id="complaint"
              placeholder="mis. Demam dan batuk sejak 3 hari"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </Field>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada pasien. Daftarkan pasien di modul Registrasi terlebih dahulu.
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={saving || patients.length === 0} className="w-full">
            {saving ? 'Mengirim FHIR Encounter…' : 'Mulai Kunjungan & Antrikan ke Dokter'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Kunjungan"
          description={`${visits.length} kunjungan tercatat`}
          icon={<Stethoscope className="size-4.5" />}
        />
        {activeVisits.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Stethoscope className="size-6" />}
              title="Belum ada kunjungan"
              description="Buat kunjungan untuk memulai alur pelayanan pasien."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activeVisits.map((v) => {
              const p = getPatient(v.patientId)
              return (
                <li key={v.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">{p?.mrn}</span> ·{' '}
                        {formatTime(v.createdAt)}
                      </p>
                    </div>
                    <Badge tone="muted" mono>
                      Encounter/{v.encounterId}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Keluhan:</span> {v.complaint}
                  </p>
                  <VisitStepper stage={v.stage} />
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
