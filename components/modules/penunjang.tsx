'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge, Card, CardHeader, EmptyState, Field, TextInput } from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { formatRupiah, formatTime } from '@/lib/format'
import { FlaskConical } from 'lucide-react'

export function PenunjangModule() {
  const { labQueue, getPatient, completeLabOrder } = useStore()
  const [results, setResults] = useState<Record<string, string>>({})

  function setResult(orderId: string, value: string) {
    setResults((prev) => ({ ...prev, [orderId]: value }))
  }

  return (
    <Card>
      <CardHeader
        title="Pemeriksaan Penunjang"
        description="Order laboratorium & radiologi dari dokter. Input hasil untuk menyelesaikan."
        icon={<FlaskConical className="size-4.5" />}
      />
      {labQueue.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<FlaskConical className="size-6" />}
            title="Tidak ada order"
            description="Order pemeriksaan dari dokter akan muncul di sini."
          />
        </div>
      ) : (
        <div className="space-y-4 p-5">
          {labQueue.map((v) => {
            const p = getPatient(v.patientId)
            const pending = v.labOrders.filter((o) => o.status === 'requested')
            return (
              <div key={v.id} className="rounded-lg border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{p?.name}</p>
                    <p className="font-mono text-xs tabular-nums text-muted-foreground">
                      {p?.mrn}
                      {v.diagnosis ? ` · ${v.diagnosis.code}` : ''}
                    </p>
                  </div>
                  <Badge tone="warning">{pending.length} menunggu hasil</Badge>
                </div>
                <div className="divide-y divide-border">
                  {pending.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-end gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{o.name}</span>
                          <Badge tone={o.category === 'Radiologi' ? 'warning' : 'primary'}>
                            {o.category}
                          </Badge>
                        </div>
                        <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                          {formatRupiah(o.price)} · diminta {formatTime(o.createdAt)}
                          {o.serviceRequestId ? ` · SR/${o.serviceRequestId}` : ''}
                        </p>
                      </div>
                      <Field label="Hasil" htmlFor={`res-${o.id}`} className="min-w-56 flex-1">
                        <TextInput
                          id={`res-${o.id}`}
                          placeholder={o.category === 'Radiologi' ? 'mis. Cor & pulmo dalam batas normal' : 'mis. Hb 13.5 g/dL, leukosit normal'}
                          value={results[o.id] ?? ''}
                          onChange={(e) => setResult(o.id, e.target.value)}
                        />
                      </Field>
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => completeLabOrder(v.id, o.id, results[o.id]?.trim() || 'Selesai (tanpa catatan)')}
                      >
                        Selesaikan
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
