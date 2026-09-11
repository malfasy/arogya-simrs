'use client'

import { useState } from 'react'
import { Shell } from '@/components/shell'
import { StoreProvider } from '@/components/store'
import { AuthGate } from '@/components/auth'
import type { DemoAccount } from '@/lib/data'

export default function Page() {
  const [user, setUser] = useState<DemoAccount | null>(null)

  if (!user) {
    return <AuthGate onLogin={setUser} />
  }

  return (
    <StoreProvider>
      <Shell user={user} onLogout={() => setUser(null)} />
    </StoreProvider>
  )
}
