import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRegister } from '../lib/api'
import { getTokenPayload, setAuth } from '../lib/auth'
import { normalizePlanId } from '../utils/plans'
import { Seo } from '../components/Seo'

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <Seo title="Create account" description="Create your AxisCloud account." noindex />
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Create your account to continue.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setLoading(true)
            try {
              const res = await apiRegister({ username, email, password })
              const payload = getTokenPayload(res.token)
              const tokenPlan = payload?.plan
              const plan = normalizePlanId(res.plan ?? (typeof tokenPlan === 'string' ? tokenPlan : undefined))
              setAuth({ token: res.token, username: res.username, plan })
              navigate('/dashboard', { replace: true })
            } catch (err: any) {
              setError(err?.message ?? 'Registration failed')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              className="ui-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              type="text"
              required
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
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
            {loading ? 'Creating…' : 'Create account'}
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
