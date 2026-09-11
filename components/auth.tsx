'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, TextInput, Badge } from '@/components/ui/primitives'
import { DEMO_ACCOUNTS, type DemoAccount } from '@/lib/data'
import { Activity, HeartPulse, ShieldCheck, Workflow, Lock, User } from 'lucide-react'

interface AuthGateProps {
  onLogin: (account: DemoAccount) => void
}

export function AuthGate({ onLogin }: AuthGateProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const match = DEMO_ACCOUNTS.find(
      (a) => a.username === username.trim().toLowerCase() && a.password === password,
    )
    if (!match) {
      setError('Username atau kata sandi salah.')
      return
    }
    setError('')
    onLogin(match)
  }

  function quickFill(a: DemoAccount) {
    setUsername(a.username)
    setPassword(a.password)
    setError('')
  }

  return (
    <div className="flex min-h-dvh">
      {/* Panel kiri — onboarding / selamat datang */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartPulse className="size-6" />
          </span>
          <div>
            <p className="text-lg font-semibold text-sidebar-accent-foreground">Arogya</p>
            <p className="text-xs text-sidebar-foreground/70">Sistem Informasi Manajemen Rumah Sakit</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight text-balance text-sidebar-accent-foreground">
            Selamat datang di Arogya
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80">
            Kelola alur pasien dari registrasi hingga kasir dalam satu sistem, dengan
            pencatatan klinis yang otomatis terhubung ke platform Satu Sehat (FHIR R4).
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: Workflow, title: 'Alur terpadu', desc: 'Registrasi, poliklinik, farmasi, dan kasir dalam satu aliran.' },
              { icon: ShieldCheck, title: 'Terintegrasi Satu Sehat', desc: 'Kirim resource Patient, Encounter, dan Condition secara otomatis.' },
              { icon: Activity, title: 'Rekam medis rapi', desc: 'Diagnosis ICD-10 dan resep tercatat per kunjungan.' },
            ].map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary-foreground">
                  <f.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-sidebar-accent-foreground">{f.title}</p>
                  <p className="text-xs text-sidebar-foreground/70">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-sidebar-foreground/60">
          Arogya &middot; Prototipe akademik. Integrasi Satu Sehat menggunakan mock FHIR R4.
        </p>
      </div>

      {/* Panel kanan — form login */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="size-5" />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">Arogya</p>
              <p className="text-xs text-muted-foreground">SIMRS &middot; Satu Sehat</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground">Masuk ke akun Anda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan kredensial staf rumah sakit untuk melanjutkan.
          </p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            <Field label="Username" htmlFor="username">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <TextInput
                  id="username"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="mis. admin"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Kata Sandi" htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <TextInput
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="pl-9"
                />
              </div>
            </Field>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="mt-2 w-full">
              Masuk
            </Button>
          </form>

          <div className="mt-8">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Akun contoh (klik untuk mengisi otomatis):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.username}
                  type="button"
                  onClick={() => quickFill(a)}
                  className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card px-3 py-2 text-left transition hover:border-primary/40 hover:bg-muted"
                >
                  <Badge tone="muted">{a.role}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {a.username} / {a.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
