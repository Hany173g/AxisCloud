import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiCheckCode, apiUpdatePassword } from '../lib/api'
import { Seo } from '../components/Seo'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token') || '', [params])

  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)
      setDone(false)

      if (!token) {
        setStatus('invalid')
        return
      }

      setStatus('checking')
      try {
        await apiCheckCode(token)
        if (!cancelled) setStatus('valid')
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Invalid or expired token')
          setStatus('invalid')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <>
      <Seo title="Reset password" description="Choose a new password for your AxisCloud account." noindex />
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Choose a new password</h1>
        <p className="mt-1 text-sm text-slate-600">Create a new password for your account.</p>

        {status === 'checking' ? (
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Checking reset link…
          </div>
        ) : null}

        {status === 'invalid' ? (
          <div className="mt-6 space-y-3">
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error || 'Invalid or expired reset link.'}
            </div>
            <Link className="text-sm text-brand-700 hover:text-brand-800" to="/forgot-password">
              Request a new link
            </Link>
          </div>
        ) : null}

        {status === 'valid' ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              setLoading(true)
              try {
                await apiUpdatePassword(token, { password })
                setDone(true)
              } catch (err: any) {
                setError(err?.message ?? 'Failed to update password')
              } finally {
                setLoading(false)
              }
            }}
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input
                className="ui-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                type="password"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 6 characters.</p>
            </div>

            {done ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                Password updated. You can sign in now.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="ui-btn-primary w-full"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>

            <div className="text-center text-sm">
              <Link className="text-slate-600 hover:text-slate-900" to="/login">
                Back to sign in
              </Link>
            </div>
          </form>
        ) : null}
        </div>
      </div>
    </>
  )
}
