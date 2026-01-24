import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, onAuthChange } from '../lib/auth'
import { apiGetHome } from '../lib/api'

export function HomePage() {
  const [auth, setAuthState] = useState(getAuth())
  const [loggedIn, setLoggedIn] = useState(false)
  const [logsCount, setLogsCount] = useState(0)
  const [monitorsCount, setMonitorsCount] = useState(0)

  useEffect(() => {
    return onAuthChange(() => setAuthState(getAuth()))
  }, [])

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        const data = await apiGetHome()
        if (!alive) return
        setLoggedIn(!!data.userData)
        setLogsCount(data.logsCount)
        setMonitorsCount(data.monitorsCount)
      } catch {
        if (!alive) return
        setLoggedIn(false)
        setLogsCount(0)
        setMonitorsCount(0)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [auth.token])

  return (
    <div className="w-full">
      <section className="w-full bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
              Reliability tooling for modern web services
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              AxisCloud is a SaaS platform for uptime monitoring, rate limiting, and operational essentials.
              Start by creating an account.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {loggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    to="/payment/upgrade"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Upgrade plan
                  </Link>
                  <Link
                    to="/monitors/new"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Create monitor
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Upgrade plan
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uptime monitoring</div>
                <div className="mt-1 text-sm text-slate-800">Track availability and response time</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rate limiting</div>
                <div className="mt-1 text-sm text-slate-800">Control traffic and protect your APIs</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-50 to-emerald-50" />
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uptime monitor</div>
                  <div className="rounded-md bg-brand-800 px-3 py-1 text-xs font-medium text-white">Active</div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    https://example.com/health
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">GET</div>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">5s</div>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">10m</div>
                  </div>
                  <div className="rounded-md bg-emerald-600 px-3 py-2 text-center text-xs font-medium text-white">
                    Create monitor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Total Logs</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{logsCount}</div>
              <div className="mt-1 text-sm text-slate-600">Monitor checks stored across the platform.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Total Monitors</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{monitorsCount}</div>
              <div className="mt-1 text-sm text-slate-600">Active and inactive monitors created by users.</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Clear layout</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                Full-width sections with consistent spacing and clear hierarchy.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">Built for teams</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                Designed to support production workflows with a clean, focused UI.
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">No noise</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                No fake metrics, no placeholders — only what matters.
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-slate-900">Ready to continue?</div>
              <div className="mt-1 text-sm text-slate-600">
                {loggedIn ? 'Continue from your dashboard.' : 'Sign in or create a new account.'}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {loggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    to="/monitors/new"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Create monitor
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
