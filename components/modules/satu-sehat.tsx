'use client'

import { useState } from 'react'
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui/primitives'
import { useStore } from '@/components/store'
import { formatTime } from '@/lib/format'
import type { FhirLog, FhirResourceType } from '@/lib/types'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const toneByType: Record<FhirResourceType, 'primary' | 'success' | 'warning' | 'muted'> = {
  OAuth2: 'warning',
  Patient: 'primary',
  Encounter: 'success',
  Condition: 'muted',
}

function LogEntry({ log }: { log: FhirLog }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <ChevronRight
          className={cn('size-4 text-muted-foreground transition', open && 'rotate-90')}
        />
        <Badge tone={toneByType[log.resourceType]}>{log.resourceType}</Badge>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{log.method}</span>
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
          {log.endpoint}
        </span>
        <span
          className={cn(
            'font-mono text-xs font-semibold tabular-nums',
            log.status < 300 ? 'text-success' : 'text-destructive',
          )}
        >
          {log.status}
        </span>
        <span className="hidden font-mono text-[11px] tabular-nums text-muted-foreground sm:inline">
          {formatTime(log.timestamp)}
        </span>
      </button>
      {open ? (
        <div className="grid gap-3 border-t border-border px-4 py-3 lg:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Request
            </p>
            <pre className="max-h-80 overflow-auto rounded-lg bg-sidebar p-3 font-mono text-xs leading-relaxed text-sidebar-foreground">
              {JSON.stringify(log.request, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Response
            </p>
            <pre className="max-h-80 overflow-auto rounded-lg bg-sidebar p-3 font-mono text-xs leading-relaxed text-sidebar-foreground">
              {JSON.stringify(log.response, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </li>
  )
}

export function SatuSehatModule() {
  const { logs, token } = useStore()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Status Integrasi Satu Sehat"
          description="Autentikasi OAuth2 & endpoint FHIR R4 (mock Kemenkes)."
          icon={<ShieldCheck className="size-4.5" />}
          action={
            <Badge tone={token ? 'success' : 'muted'}>
              {token ? 'Terautentikasi' : 'Belum ada token'}
            </Badge>
          }
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Access Token (Bearer)
            </p>
            <p className="mt-1 break-all font-mono text-xs text-foreground">
              {token ? token.access_token : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total Komunikasi FHIR
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {logs.length}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Log Komunikasi FHIR"
          description="Setiap request & response ditampilkan sebagai JSON."
        />
        {logs.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<ShieldCheck className="size-6" />}
              title="Belum ada komunikasi"
              description="Log akan terisi saat pasien didaftarkan dan alur pelayanan berjalan."
            />
          </div>
        ) : (
          <ul className="space-y-3 p-5">
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
