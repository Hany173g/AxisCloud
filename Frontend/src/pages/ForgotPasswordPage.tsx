import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiCreateCode } from '../lib/api'
import { Seo } from '../components/Seo'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <Seo title="Reset password" description="Request a password reset link." noindex />
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-600">We will email you a reset link.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setDone(false)
            setLoading(true)
            try {
              await apiCreateCode({ email })
              setDone(true)
            } catch (err: any) {
              setError(err?.message ?? 'Request failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              className="ui-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              type="email"
              required
            />
          </div>

          {done ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              If the email exists, a reset link has been sent.
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
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <div className="text-center text-sm">
            <Link className="text-slate-600 hover:text-slate-900" to="/login">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
      </div>
    </>
  )
}
