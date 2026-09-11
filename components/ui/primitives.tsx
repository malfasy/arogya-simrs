import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-semibold leading-tight text-foreground text-pretty">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
  className,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

const inputBase =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-muted-foreground'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, 'pr-8', props.className)} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, 'min-h-20 resize-y', props.className)} />
}

type Tone = 'primary' | 'success' | 'warning' | 'muted' | 'destructive'

const toneMap: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/15 text-warning-foreground border-warning/30',
  muted: 'bg-muted text-muted-foreground border-border',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function Badge({
  children,
  tone = 'muted',
  className,
  mono,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  mono?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        toneMap[tone],
        mono && 'font-mono tabular-nums',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">{description}</p>
      ) : null}
    </div>
  )
}

export function Stat({
  label,
  value,
  icon,
  tone = 'primary',
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: Tone
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon ? (
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              toneMap[tone].replace('border', 'border-transparent'),
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</p>
    </Card>
  )
}
