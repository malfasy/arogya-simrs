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
} from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { ICD10_CODES } from '@/lib/data'
import { formatRupiah, formatTime } from '@/lib/format'
import type { PrescriptionItem } from '@/lib/types'
import { Pill, Stethoscope, Trash2, Users } from 'lucide-react'

export function PoliklinikModule() {
  const { doctorQueue, drugs, getPatient, examinePatient } = useStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [diagnosisCode, setDiagnosisCode] = useState('')
  const [items, setItems] = useState<PrescriptionItem[]>([])
  const [drugId, setDrugId] = useState('')
  const [qty, setQty] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = doctorQueue.find((v) => v.id === selectedId) ?? null

  // Keep a valid selection as the queue changes.
  useEffect(() => {
    if (doctorQueue.length === 0) {
      setSelectedId(null)
    } else if (!doctorQueue.some((v) => v.id === selectedId)) {
      setSelectedId(doctorQueue[0].id)
    }
  }, [doctorQueue, selectedId])

  function resetForm() {
    setDiagnosisCode('')
    setItems([])
    setDrugId('')
    setQty(1)
    setError(null)
  }

  function addItem() {
    const drug = drugs.find((d) => d.id === drugId)
    if (!drug || qty < 1) return
    setItems((prev) => {
      const existing = prev.find((i) => i.drugId === drug.id)
      if (existing) {
        return prev.map((i) =>
          i.drugId === drug.id ? { ...i, quantity: i.quantity + qty } : i,
        )
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

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  )

  async function handleSave() {
    if (!selected) return
    setError(null)
    const icd = ICD10_CODES.find((c) => c.code === diagnosisCode)
    if (!icd) {
      setError('Pilih diagnosis ICD-10 terlebih dahulu.')
      return
    }
    if (items.length === 0) {
      setError('Tambahkan minimal satu obat ke resep.')
      return
    }
    setSaving(true)
    try {
      await examinePatient(selected.id, { code: icd.code, display: icd.display }, items)
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
          description="Tetapkan diagnosis ICD-10 dan susun resep."
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
                return (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">{p?.mrn}</span> · NIK{' '}
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
                  <TextInput
                    id="qty"
                    type="number"
                    min={1}
                    className="font-mono tabular-nums"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  />
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
                          <td className="px-4 py-2 text-center font-mono tabular-nums">
                            {i.quantity}
                          </td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">
                            {formatRupiah(i.price * i.quantity)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => removeItem(i.drugId)}
                              aria-label={`Hapus ${i.name}`}
                            >
                              <Trash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-muted/40">
                        <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium">
                          Subtotal Obat
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums text-foreground">
                          {formatRupiah(subtotal)}
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
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              {diagnosisCode ? (
                <Badge tone="primary" mono>
                  ICD-10 {diagnosisCode}
                </Badge>
              ) : (
                <span />
              )}
              <Button type="button" size="lg" onClick={handleSave} disabled={saving}>
                {saving ? 'Mengirim FHIR Condition…' : 'Simpan & Kirim ke Farmasi'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
