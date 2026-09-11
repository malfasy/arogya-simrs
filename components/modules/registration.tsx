'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge, Card, CardHeader, EmptyState, Field, Select, TextInput, Textarea } from '@/components/ui/primitives'
import { useStore, type NewPatientInput } from '@/components/store'
import { calculateAge, formatDate } from '@/lib/format'
import { UserPlus, Users } from 'lucide-react'

const empty: NewPatientInput = {
  nik: '',
  name: '',
  gender: 'male',
  birthDate: '',
  address: '',
  phone: '',
}

export function RegistrationModule() {
  const { patients, registerPatient } = useStore()
  const [form, setForm] = useState<NewPatientInput>(empty)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof NewPatientInput>(key: K, value: NewPatientInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{16}$/.test(form.nik)) {
      setError('NIK harus terdiri dari 16 digit angka.')
      return
    }
    if (!form.name.trim() || !form.birthDate || !form.phone.trim()) {
      setError('Nama, tanggal lahir, dan nomor telepon wajib diisi.')
      return
    }
    setSaving(true)
    try {
      await registerPatient({ ...form, name: form.name.trim() })
      setForm(empty)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <Card>
        <CardHeader
          title="Pendaftaran Pasien Baru"
          description="Data pasien dikirim sebagai FHIR Patient ke Satu Sehat."
          icon={<UserPlus className="size-4.5" />}
        />
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <Field label="NIK" htmlFor="nik" hint="16 digit sesuai KTP (identifier NIK).">
            <TextInput
              id="nik"
              inputMode="numeric"
              maxLength={16}
              placeholder="3201xxxxxxxxxxxx"
              className="font-mono tabular-nums"
              value={form.nik}
              onChange={(e) => update('nik', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label="Nama Lengkap" htmlFor="name">
            <TextInput
              id="name"
              placeholder="Nama pasien"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Jenis Kelamin" htmlFor="gender">
              <Select
                id="gender"
                value={form.gender}
                onChange={(e) => update('gender', e.target.value as NewPatientInput['gender'])}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </Select>
            </Field>
            <Field label="Tanggal Lahir" htmlFor="birthDate">
              <TextInput
                id="birthDate"
                type="date"
                className="font-mono"
                value={form.birthDate}
                onChange={(e) => update('birthDate', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Alamat" htmlFor="address">
            <Textarea
              id="address"
              placeholder="Alamat domisili"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </Field>
          <Field label="No. Telepon" htmlFor="phone">
            <TextInput
              id="phone"
              inputMode="numeric"
              placeholder="08xxxxxxxxxx"
              className="font-mono tabular-nums"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value.replace(/[^\d+]/g, ''))}
            />
          </Field>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={saving} className="w-full">
            {saving ? 'Mengirim ke Satu Sehat…' : 'Daftarkan & Kirim FHIR Patient'}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Daftar Pasien Terdaftar"
          description={`${patients.length} pasien dalam sistem`}
          icon={<Users className="size-4.5" />}
        />
        {patients.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Users className="size-6" />}
              title="Belum ada pasien"
              description="Daftarkan pasien pertama melalui formulir di samping."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">No. RM</th>
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">NIK</th>
                  <th className="px-5 py-3 font-medium">Usia</th>
                  <th className="px-5 py-3 font-medium">Satu Sehat ID</th>
                </tr>
              </thead>
              <tbody>
                {[...patients].reverse().map((p) => {
                  const age = calculateAge(p.birthDate)
                  return (
                    <tr key={p.id} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3 font-mono text-xs tabular-nums text-foreground">
                        {p.mrn}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.gender === 'male' ? 'Laki-laki' : 'Perempuan'} &middot;{' '}
                          {formatDate(p.birthDate)}
                        </p>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                        {p.nik}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                        {age != null ? `${age} th` : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone="primary" mono>
                          {p.satuSehatId ?? '—'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
