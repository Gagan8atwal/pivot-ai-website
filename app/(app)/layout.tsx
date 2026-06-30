import type { Metadata } from 'next'
import { AuthProvider } from '@/components/app/auth-provider'
import { AppShell } from '@/components/app/app-shell'

export const metadata: Metadata = {
  title: 'App',
  robots: { index: false, follow: false },
}

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
