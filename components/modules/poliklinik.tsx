'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Select,
  TextInput,
  Textarea,
} from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { ICD10_CODES, LAB_TESTS } from '@/lib/data'
import { formatRupiah, formatTime } from '@/lib/format'
import type { LabTestDef, PrescriptionItem, Vitals } from '@/lib/types'
import { FlaskConical, Pill, Stethoscope, Trash2, Users } from 'lucide-react'

const emptyVitals: Vitals = {
  systolic: '',
  diastolic: '',
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  weight: '',
  height: '',
}

export function PoliklinikModule() {
  const { doctorQueue, drugs, getPatient, examinePatient } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [diagnosisCode, setDiagnosisCode] = useState('')
  const [vitals, setVitals] = useState<Vitals>(emptyVitals)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [drugId, setDrugId] = useState('')
  const [qty, setQty] = useState(1)
  const [labTests, setLabTests] = useState<LabTestDef[]>([])
  const [labId, setLabId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = doctorQueue.find((v) => v.id === selectedId) ?? null

  useEffect(() => {
    if (doctorQueue.length === 0) {
      setSelectedId(null)
    } else if (!doctorQueue.some((v) => v.id === selectedId)) {
      setSelectedId(doctorQueue[0].id)
    }
  }, [doctorQueue, selectedId])

  function resetForm() {
    setDiagnosisCode('')
    setVitals(emptyVitals)
    setNotes('')
    setItems([])
    setDrugId('')
    setQty(1)
    setLabTests([])
    setLabId('')
    setError(null)
  }

  function setVital(key: keyof Vitals, value: string) {
    setVitals((prev) => ({ ...prev, [key]: value }))
  }

  function addItem() {
    const drug = drugs.find((d) => d.id === drugId)
    if (!drug || qty < 1) return
    setItems((prev) => {
      const existing = prev.find((i) => i.drugId === drug.id)
      if (existing) {
        return prev.map((i) => (i.drugId === drug.id ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [
        ...prev,
        { drugId: drug.id, name: drug.name, price: drug.price, quantity: qty, unit: drug.unit },
      ]
    })
    setDrugId('')
    setQty(1)
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.drugId !== id))
  }

  function addLabTest() {
    const test = LAB_TESTS.find((t) => t.id === labId)
    if (!test) return
    setLabTests((prev) => (prev.some((t) => t.id === test.id) ? prev : [...prev, test]))
    setLabId('')
  }

  function removeLabTest(id: string) {
    setLabTests((prev) => prev.filter((t) => t.id !== id))
  }

  const drugSubtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items])
  const labSubtotal = useMemo(() => labTests.reduce((s, t) => s + t.price, 0), [labTests])

  async function handleSave() {
    if (!selected) return
    setError(null)
    const icd = ICD10_CODES.find((c) => c.code === diagnosisCode)
    if (!icd) {
      setError('Pilih diagnosis ICD-10 terlebih dahulu.')
      return
    }
    setSaving(true)
    try {
      await examinePatient(selected.id, {
        diagnosis: { code: icd.code, display: icd.display },
        vitals,
        clinicalNotes: notes,
        prescription: items,
        labTests,
      })
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <Card className="h-fit">
        <CardHeader
          title="Antrian Dokter"
          description={`${doctorQueue.length} pasien menunggu`}
          icon={<Users className="size-4.5" />}
        />
        {doctorQueue.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Users className="size-6" />}
              title="Antrian kosong"
              description="Pasien akan muncul setelah kunjungan dibuat."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {doctorQueue.map((v, idx) => {
              const p = getPatient(v.patientId)
              const isActive = v.id === selectedId
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(v.id)
                      resetForm()
                    }}
                    className={
                      'flex w-full items-center gap-3 px-5 py-3 text-left transition ' +
                      (isActive ? 'bg-accent' : 'hover:bg-muted')
                    }
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold tabular-nums text-primary">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{p?.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {v.complaint}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatTime(v.createdAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Pemeriksaan Dokter"
          description="Isi kondisi klinis, diagnosis, resep, dan order pemeriksaan penunjang."
          icon={<Stethoscope className="size-4.5" />}
        />
        {!selected ? (
          <div className="p-5">
            <EmptyState
              icon={<Stethoscope className="size-6" />}
              title="Pilih pasien dari antrian"
              description="Belum ada pasien terpilih untuk diperiksa."
            />
          </div>
        ) : (
          <div className="space-y-6 p-5">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              {(() => {
                const p = getPatient(selected.patientId)
                const age = p
                  ? Math.max(
                      0,
                      new Date().getFullYear() - new Date(p.birthDate).getFullYear(),
                    )
                  : null
                return (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">{p?.mrn}</span> ·{' '}
                        {p?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                        {age !== null ? ` · ${age} th` : ''} · NIK{' '}
                        <span className="font-mono tabular-nums">{p?.nik}</span>
                      </p>
                    </div>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Keluhan:</span>{' '}
                      {selected.complaint}
                    </p>
                  </div>
                )
              })()}
            </div>

            {/* Tanda vital */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Tanda Vital</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Sistolik" htmlFor="sys">
                  <TextInput id="sys" inputMode="numeric" placeholder="120" className="font-mono tabular-nums"
                    value={vitals.systolic} onChange={(e) => setVital('systolic', e.target.value)} />
                </Field>
                <Field label="Diastolik" htmlFor="dia">
                  <TextInput id="dia" inputMode="numeric" placeholder="80" className="font-mono tabular-nums"
                    value={vitals.diastolic} onChange={(e) => setVital('diastolic', e.target.value)} />
                </Field>
                <Field label="Suhu (°C)" htmlFor="temp">
                  <TextInput id="temp" inputMode="decimal" placeholder="36.7" className="font-mono tabular-nums"
                    value={vitals.temperature} onChange={(e) => setVital('temperature', e.target.value)} />
                </Field>
                <Field label="Nadi (bpm)" htmlFor="hr">
                  <TextInput id="hr" inputMode="numeric" placeholder="80" className="font-mono tabular-nums"
                    value={vitals.heartRate} onChange={(e) => setVital('heartRate', e.target.value)} />
                </Field>
                <Field label="Napas (x/mnt)" htmlFor="rr">
                  <TextInput id="rr" inputMode="numeric" placeholder="18" className="font-mono tabular-nums"
                    value={vitals.respiratoryRate} onChange={(e) => setVital('respiratoryRate', e.target.value)} />
                </Field>
                <Field label="Berat (kg)" htmlFor="wt">
                  <TextInput id="wt" inputMode="decimal" placeholder="60" className="font-mono tabular-nums"
                    value={vitals.weight} onChange={(e) => setVital('weight', e.target.value)} />
                </Field>
                <Field label="Tinggi (cm)" htmlFor="ht">
                  <TextInput id="ht" inputMode="numeric" placeholder="165" className="font-mono tabular-nums"
                    value={vitals.height} onChange={(e) => setVital('height', e.target.value)} />
                </Field>
              </div>
            </div>

            <Field label="Diagnosis (ICD-10)" htmlFor="icd">
              <Select id="icd" value={diagnosisCode} onChange={(e) => setDiagnosisCode(e.target.value)}>
                <option value="">— Pilih kode ICD-10 —</option>
                {ICD10_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} · {c.display}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Catatan Klinis / Anamnesis" htmlFor="notes" hint="Riwayat, pemeriksaan fisik, tata laksana.">
              <Textarea id="notes" placeholder="mis. Pasien tampak lemas, faring hiperemis. Rencana observasi & terapi simtomatik."
                value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            {/* Order penunjang */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Pemeriksaan Penunjang (Lab / Radiologi)</h3>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Jenis Pemeriksaan" htmlFor="lab" className="min-w-56 flex-1">
                  <Select id="lab" value={labId} onChange={(e) => setLabId(e.target.value)}>
                    <option value="">— Pilih pemeriksaan —</option>
                    <optgroup label="Laboratorium">
                      {LAB_TESTS.filter((t) => t.category === 'Laboratorium').map((t) => (
                        <option key={t.id} value={t.id}>{t.name} — {formatRupiah(t.price)}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Radiologi">
                      {LAB_TESTS.filter((t) => t.category === 'Radiologi').map((t) => (
                        <option key={t.id} value={t.id}>{t.name} — {formatRupiah(t.price)}</option>
                      ))}
                    </optgroup>
                  </Select>
                </Field>
                <Button type="button" variant="secondary" size="lg" onClick={addLabTest} disabled={!labId}>
                  Order
                </Button>
              </div>

              {labTests.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Pemeriksaan</th>
                        <th className="px-4 py-2 font-medium">Kategori</th>
                        <th className="px-4 py-2 text-right font-medium">Biaya</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {labTests.map((t) => (
                        <tr key={t.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-2 text-foreground">{t.name}</td>
                          <td className="px-4 py-2">
                            <Badge tone={t.category === 'Radiologi' ? 'warning' : 'primary'}>{t.category}</Badge>
                          </td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">
                            {formatRupiah(t.price)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button type="button" variant="destructive" size="icon-sm"
                              onClick={() => removeLabTest(t.id)} aria-label={`Hapus ${t.name}`}>
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/40">
                        <td colSpan={2} className="px-4 py-2 text-right text-sm font-medium">Subtotal Penunjang</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums text-foreground">
                          {formatRupiah(labSubtotal)}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada order pemeriksaan penunjang.</p>
              )}
            </div>

            {/* Resep obat */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Resep Obat</h3>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <Field label="Obat" htmlFor="drug" className="min-w-52 flex-1">
                  <Select id="drug" value={drugId} onChange={(e) => setDrugId(e.target.value)}>
                    <option value="">— Pilih obat —</option>
                    {drugs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {formatRupiah(d.price)} (stok {d.stock})
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Jumlah" htmlFor="qty" className="w-24">
                  <TextInput id="qty" type="number" min={1} className="font-mono tabular-nums"
                    value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
                </Field>
                <Button type="button" variant="secondary" size="lg" onClick={addItem} disabled={!drugId}>
                  Tambah
                </Button>
              </div>

              {items.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Obat</th>
                        <th className="px-4 py-2 text-right font-medium">Harga</th>
                        <th className="px-4 py-2 text-center font-medium">Qty</th>
                        <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i) => (
                        <tr key={i.drugId} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-2 text-foreground">{i.name}</td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                            {formatRupiah(i.price)}
                          </td>
                          <td className="px-4 py-2 text-center font-mono tabular-nums">{i.quantity}</td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">
                            {formatRupiah(i.price * i.quantity)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button type="button" variant="destructive" size="icon-sm"
                              onClick={() => removeItem(i.drugId)} aria-label={`Hapus ${i.name}`}>
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/40">
                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium">Subtotal Obat</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums text-foreground">
                          {formatRupiah(drugSubtotal)}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada obat pada resep.</p>
              )}
            </div>

            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {diagnosisCode ? <Badge tone="primary" mono>ICD-10 {diagnosisCode}</Badge> : null}
                {labTests.length > 0 ? <Badge tone="muted">{labTests.length} order penunjang</Badge> : null}
              </div>
              <Button type="button" size="lg" onClick={handleSave} disabled={saving}>
                {saving ? 'Mengirim resource FHIR…' : 'Simpan & Kirim ke Farmasi'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}