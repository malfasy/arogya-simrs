'use client'

import { Button } from '@/components/ui/button'
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { formatRupiah } from '@/lib/format'
import { Box, Package, Pill } from 'lucide-react'

export function PharmacyModule() {
  const { pharmacyQueue, drugs, getPatient, dispenseMedicine } = useStore()

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,20rem)]">
      <Card>
        <CardHeader
          title="Resep Masuk"
          description={`${pharmacyQueue.length} resep menunggu penyerahan`}
          icon={<Pill className="size-4.5" />}
        />
        {pharmacyQueue.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Pill className="size-6" />}
              title="Tidak ada resep"
              description="Resep akan muncul setelah dokter menyimpan hasil pemeriksaan."
            />
          </div>
        ) : (
          <ul className="space-y-4 p-5">
            {pharmacyQueue.map((v) => {
              const p = getPatient(v.patientId)
              const subtotal = v.prescription.reduce((s, i) => s + i.price * i.quantity, 0)
              return (
                <li key={v.id} className="rounded-xl border border-border bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{p?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono tabular-nums">{p?.mrn}</span>
                      </p>
                    </div>
                    {v.diagnosis ? (
                      <Badge tone="primary" mono>
                        {v.diagnosis.code} · {v.diagnosis.display}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-2 font-medium">Obat</th>
                          <th className="px-4 py-2 text-right font-medium">Harga</th>
                          <th className="px-4 py-2 text-center font-medium">Qty</th>
                          <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {v.prescription.map((i) => (
                          <tr key={i.drugId} className="border-b border-border/60 last:border-0">
                            <td className="px-4 py-2 text-foreground">
                              {i.name}
                              <span className="text-muted-foreground"> · {i.unit}</span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                              {formatRupiah(i.price)}
                            </td>
                            <td className="px-4 py-2 text-center font-mono tabular-nums">
                              {i.quantity}
                            </td>
                            <td className="px-4 py-2 text-right font-mono tabular-nums text-foreground">
                              {formatRupiah(i.price * i.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      Subtotal:{' '}
                      <span className="font-mono font-semibold tabular-nums text-foreground">
                        {formatRupiah(subtotal)}
                      </span>
                    </p>
                    <Button type="button" size="lg" onClick={() => dispenseMedicine(v.id)}>
                      Serahkan Obat → Kasir
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Card className="h-fit">
        <CardHeader
          title="Stok Obat"
          description="Persediaan farmasi"
          icon={<Package className="size-4.5" />}
        />
        <ul className="divide-y divide-border">
          {drugs.map((d) => {
            const low = d.stock <= 100
            return (
              <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatRupiah(d.price)} / {d.unit}
                  </p>
                </div>
                <Badge tone={low ? 'warning' : 'success'} mono>
                  <Box className="size-3" />
                  {d.stock}
                </Badge>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
