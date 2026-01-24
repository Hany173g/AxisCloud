import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGetHome, apiGetMonitors, type HomeUserData, type Monitor } from '../lib/api'
import { clearAuth, getAuth } from '../lib/auth'

export function DashboardPage() {
  const navigate = useNavigate()
  const { token } = getAuth()
  const [homeUser, setHomeUser] = useState<HomeUserData | null>(null)
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    let alive = true

    async function loadHome() {
      if (!token) return
      try {
        const data = await apiGetHome()
        if (!alive) return
        if (!data.userData) {
          clearAuth()
          navigate('/login', { replace: true })
          return
        }
        setHomeUser(data.userData)
      } catch (err: any) {
        if (!alive) return
        if (err?.status === 401) {
          clearAuth()
          navigate('/login', { replace: true })
        }
      }
    }

    loadHome()
    return () => {
      alive = false
    }
  }, [token, navigate])

  useEffect(() => {
    if (!token) return

    async function fetchMonitors() {
      try {
        const data = await apiGetMonitors({ sort: '-createdAt' })
        setMonitors(data.montiors)
      } catch (err) {
        console.error('Failed to fetch monitors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMonitors()
  }, [token])

  const activeMonitors = monitors.filter(m => m.isActive).length
  const totalMonitors = monitors.length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome{homeUser?.username ? `, ${homeUser.username}` : ''}.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-2xl font-bold text-slate-900">{totalMonitors}</div>
            <div className="text-sm text-slate-600">Total Monitors</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-2xl font-bold text-emerald-700">{activeMonitors}</div>
            <div className="text-sm text-emerald-600">Active Monitors</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {totalMonitors === 0 
              ? "Create your first monitor to get started."
              : `Managing ${totalMonitors} monitor${totalMonitors !== 1 ? 's' : ''}.`
            }
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="ui-btn-primary" to="/monitors/new">
              Create monitor
            </Link>
            <Link className="ui-btn-secondary" to="/monitors">
              View all
            </Link>
            <Link className="ui-btn-secondary" to="/payment/upgrade">
              Upgrade plan
            </Link>
          </div>
        </div>

        {!loading && monitors.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Recent Monitors</h3>
            <div className="space-y-2">
              {monitors.slice(0, 3).map((monitor) => (
                <Link
                  key={monitor._id}
                  to={`/monitors/${monitor.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {monitor.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {monitor.url}
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ml-2 ${
                      monitor.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {monitor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {monitors.length > 3 && (
              <div className="mt-3">
                <Link
                  to="/monitors"
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  View all {monitors.length} monitors →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
