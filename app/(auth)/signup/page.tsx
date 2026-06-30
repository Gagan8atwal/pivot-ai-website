'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard, Field, FormError, FormSuccess } from '@/components/app/auth-card'
import { signUpWithPassword, isSupabaseConfigured } from '@/lib/auth'
import { errorMessage } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [business, setBusiness] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const data = await signUpWithPassword(email, password, {
        full_name: name,
        business_name: business,
      })
      // If email confirmation is required, there is no active session yet.
      if (data.session) {
        router.push('/dashboard')
      } else {
        setSuccess(
          'Account created. Check your inbox to confirm your email, then sign in.'
        )
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start answering every call with Pivot AI"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-navy-900 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <FormSuccess message={success} />
        <Field label="Your name" htmlFor="name">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
          />
        </Field>
        <Field label="Business name" htmlFor="business">
          <Input
            id="business"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="VS Carriers Inc."
            autoComplete="organization"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" className="w-full" size="lg" disabled={loading || !isSupabaseConfigured}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
