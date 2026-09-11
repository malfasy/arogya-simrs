'use client'

import { Button } from '@/components/ui/button'
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { formatRupiah } from '@/lib/format'
import { Receipt, Wallet } from 'lucide-react'

export function CashierModule() {
  const { cashierQueue, getPatient, receivePayment } = useStore()

  return (
    <Card>
      <CardHeader
        title="Kasir"
        description={`${cashierQueue.length} tagihan menunggu pembayaran`}
        icon={<Wallet className="size-4.5" />}
      />
      {cashierQueue.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Receipt className="size-6" />}
            title="Tidak ada tagihan"
            description="Tagihan muncul setelah farmasi menyerahkan obat."
          />
        </div>
      ) : (
        <ul className="grid gap-5 p-5 md:grid-cols-2">
          {cashierQueue.map((v) => {
            const p = getPatient(v.patientId)
            const medTotal = v.prescription.reduce((s, i) => s + i.price * i.quantity, 0)
            const labTotal = v.labOrders.reduce((s, o) => s + o.price, 0)
            const total = v.consultationFee + medTotal + labTotal
            return (
              <li key={v.id} className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-3">
                  <div>
                    <p className="font-medium text-foreground">{p?.name}</p>
                    <p className="font-mono text-xs tabular-nums text-muted-foreground">{p?.mrn}</p>
                  </div>
                  {v.diagnosis ? (
                    <Badge tone="primary" mono>
                      {v.diagnosis.code}
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-2 px-5 py-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Jasa konsultasi dokter</span>
                    <span className="font-mono tabular-nums text-foreground">
                      {formatRupiah(v.consultationFee)}
                    </span>
                  </div>
                  {v.prescription.map((i) => (
                    <div key={i.drugId} className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {i.name} <span className="font-mono tabular-nums">×{i.quantity}</span>
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {formatRupiah(i.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                  {v.labOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {o.name} <span className="text-xs">({o.category})</span>
                      </span>
                      <span className="font-mono tabular-nums text-foreground">
                        {formatRupiah(o.price)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-3">
                    <span className="font-semibold text-foreground">Total Tagihan</span>
                    <span className="font-mono text-lg font-semibold tabular-nums text-primary">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => receivePayment(v.id)}
                  >
                    Terima Pembayaran & Selesaikan
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}