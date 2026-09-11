'use client'

import { cn } from '@/lib/utils'
import { HeartPulse } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ModuleDef {
  key: string
  label: string
  sublabel: string
  icon: LucideIcon
  badge?: number
}

export function Sidebar({
  modules,
  active,
  onSelect,
}: {
  modules: ModuleDef[]
  active: string
  onSelect: (key: string) => void
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <HeartPulse className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">Arogya</p>
          <p className="text-xs text-sidebar-foreground/70">SIMRS &middot; Satu Sehat</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {modules.map((m) => {
          const Icon = m.icon
          const isActive = m.key === active
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onSelect(m.key)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="flex-1 font-medium">{m.label}</span>
              {typeof m.badge === 'number' && m.badge > 0 ? (
                <span
                  className={cn(
                    'flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                    isActive
                      ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                      : 'bg-primary text-primary-foreground',
                  )}
                >
                  {m.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs text-sidebar-foreground/60">
          Terhubung ke{' '}
          <span className="font-medium text-sidebar-accent-foreground">Satu Sehat</span> (mock FHIR
          R4)
        </p>
      </div>
    </aside>
  )
}
