import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { VisitStage } from '@/lib/types'

const STEPS = ['Registrasi', 'Dokter', 'Farmasi', 'Kasir', 'Selesai'] as const

const stageIndex: Record<VisitStage, number> = {
  doctor: 1,
  pharmacy: 2,
  cashier: 3,
  complete: 4,
}

export function VisitStepper({ stage }: { stage: VisitStage }) {
  const current = stageIndex[stage]
  return (
    <ol className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition',
                  done && 'bg-success text-success-foreground',
                  active && 'bg-primary text-primary-foreground ring-2 ring-primary/25',
                  !done && !active && 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span
                className={cn('mx-1 h-px w-5', i < current ? 'bg-success' : 'bg-border')}
                aria-hidden="true"
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
