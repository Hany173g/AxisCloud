import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { clearAuth, getAuth, onAuthChange, resolvePlan } from '../lib/auth'
import { apiGetHome, type HomeUserData } from '../lib/api'
import { normalizePlanId, PLANS } from '../utils/plans'

export function AppLayout() {
  const navigate = useNavigate()
  const [auth, setAuthState] = useState(getAuth())
  const [homeUser, setHomeUser] = useState<HomeUserData | null>(null)
  const [loadingHome, setLoadingHome] = useState(false)

  useEffect(() => {
    return onAuthChange(() => setAuthState(getAuth()))
  }, [])

  useEffect(() => {
    let alive = true

    async function load() {
      if (!auth.token) {
        setHomeUser(null)
        return
      }

      setLoadingHome(true)
      try {
        const data = await apiGetHome()
        if (!alive) return

        if (!data.userData) {
          clearAuth()
          setHomeUser(null)
          return
        }

        setHomeUser(data.userData)
      } catch (err: any) {
        if (!alive) return
        if (err?.status === 401) {
          clearAuth()
        }
        setHomeUser(null)
      } finally {
        if (alive) setLoadingHome(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [auth.token])

  const token = auth.token
  const username = homeUser?.username ?? null
  const planId = normalizePlanId(homeUser?.plan ?? resolvePlan())
  const planName = PLANS[planId].name

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold tracking-tight text-slate-950">
              AxisCloud
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-slate-600 sm:flex">
              <Link className="hover:text-slate-900" to="/">
                Home
              </Link>
              {token ? (
                <>
                  <Link className="hover:text-slate-900" to="/dashboard">
                    Dashboard
                  </Link>
                  <Link className="hover:text-slate-900" to="/monitors/new">
                    Monitors
                  </Link>
                </>
              ) : null}
            </nav>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {token ? (
              <>
                <span className="hidden text-slate-600 sm:inline">
                  {loadingHome ? 'Loading…' : (username ?? 'User')} · {planName}
                </span>
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    clearAuth()
                    navigate('/login', { replace: true })
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="text-slate-700 hover:text-slate-900" to="/login">
                  Sign in
                </Link>
                <Link
                  className="rounded-md bg-brand-800 px-3 py-1.5 font-medium text-white hover:bg-brand-900"
                  to="/register"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto w-full border-t border-slate-200 bg-slate-900 text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">AxisCloud</div>
            <div className="mt-1 text-xs text-slate-400">© {new Date().getFullYear()} AxisCloud. All rights reserved.</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {!token ? (
              <>
                <Link className="text-sm text-slate-300 hover:text-white" to="/login">
                  Sign in
                </Link>
                <Link className="text-sm text-slate-300 hover:text-white" to="/register">
                  Create account
                </Link>
              </>
            ) : (
              <>
                <Link className="text-sm text-slate-300 hover:text-white" to="/dashboard">
                  Dashboard
                </Link>
                <Link className="text-sm text-slate-300 hover:text-white" to="/monitors/new">
                  Create monitor
                </Link>
              </>
            )}
            <div className="flex items-center gap-3">
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                href="#"
                aria-label="X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
              <a
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700"
                href="#"
                aria-label="Link"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
