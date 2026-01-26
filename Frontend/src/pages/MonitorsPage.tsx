import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiGetMonitors, type Monitor } from '../lib/api'
import { getAuth } from '../lib/auth'
import { Seo } from '../components/Seo'

export function MonitorsPage() {
  const navigate = useNavigate()
  const { token } = getAuth()
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skip, setSkip] = useState(0)
  const [sort, setSort] = useState<'-createdAt' | 'createdAt'>('-createdAt')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastMonitorRef = useRef<HTMLTableRowElement | null>(null)

  const fetchMonitors = useCallback(async (skipCount: number, isLoadMore: boolean, sortValue: '-createdAt' | 'createdAt') => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      }
      const data = await apiGetMonitors({ skip: skipCount, sort: sortValue })
      
      if (isLoadMore) {
        setMonitors(prev => [...prev, ...data.montiors])
      } else {
        setMonitors(data.montiors)
      }
      
      setHasMore(data.montiors.length === 10)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch monitors')
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setMonitors([])
    setSkip(0)
    setHasMore(true)
    fetchMonitors(0, false, sort)
  }, [token, navigate, fetchMonitors, sort])

  useEffect(() => {
    if (loadingMore || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const newSkip = skip + 10
          setSkip(newSkip)
          fetchMonitors(newSkip, true, sort)
        }
      },
      { threshold: 0.1 }
    )

    if (lastMonitorRef.current) {
      observerRef.current.observe(lastMonitorRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadingMore, hasMore, skip, fetchMonitors, sort])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">Loading monitors...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <>
      <Seo title="Monitors" description="Manage your uptime monitors." noindex />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Monitors</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your uptime monitors.
            </p>
          </div>
          <Link
            className="ui-btn-primary"
            to="/monitors/new"
          >
            Create Monitor
          </Link>
        </div>

        {monitors.length === 0 ? (
          <div className="mt-8 text-center">
            <div className="text-sm text-slate-600">
              No monitors found. Create your first monitor to get started.
            </div>
            <Link
              className="ui-btn-primary mt-4"
              to="/monitors/new"
            >
              Create Monitor
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-500">Activation</div>
                <div className="mt-1 flex gap-2 text-sm">
                  <span className="text-slate-900">
                    Active: <span className="font-semibold">{monitors.filter((m) => m.isActive).length}</span>
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-900">
                    Inactive: <span className="font-semibold">{monitors.filter((m) => !m.isActive).length}</span>
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-medium text-slate-500">Uptime Status</div>
                <div className="mt-1 flex gap-2 text-sm">
                  <span className="text-slate-900">
                    Up: <span className="font-semibold">{monitors.filter((m) => String(m.status).toLowerCase() === 'up').length}</span>
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-900">
                    Down: <span className="font-semibold">{monitors.filter((m) => String(m.status).toLowerCase() === 'down').length}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-end gap-2">
              <div className="text-sm text-slate-600">Sort by</div>
              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={sort}
                onChange={(e) => {
                  const nextSort = e.target.value as '-createdAt' | 'createdAt'
                  setSort(nextSort)
                }}
              >
                <option value="-createdAt">Newest</option>
                <option value="createdAt">Oldest</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-left font-medium text-slate-900">Name</th>
                    <th className="pb-3 text-left font-medium text-slate-900">URL</th>
                    <th className="pb-3 text-left font-medium text-slate-900">Method</th>
                    <th className="pb-3 text-left font-medium text-slate-900">Interval</th>
                    <th className="pb-3 text-left font-medium text-slate-900">Active</th>
                    <th className="pb-3 text-left font-medium text-slate-900">Status</th>
                    <th className="pb-3 text-left font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map((monitor, index) => (
                    <tr 
                      key={monitor._id} 
                      className="border-b border-slate-100"
                      ref={index === monitors.length - 1 ? lastMonitorRef : null}
                    >
                      <td className="py-3">
                        <Link
                          to={`/monitors/${monitor.slug}`}
                          className="font-medium text-slate-900 hover:text-brand-600"
                        >
                          {monitor.name}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div className="max-w-xs truncate text-slate-600">
                          {monitor.url}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {monitor.method}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {monitor.checkInterval}m
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          monitor.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {monitor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          String(monitor.status).toLowerCase() === 'up'
                            ? 'bg-emerald-100 text-emerald-700'
                            : String(monitor.status).toLowerCase() === 'down'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {monitor.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Link
                          to={`/monitors/${monitor.slug}`}
                          className="text-brand-600 hover:text-brand-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loadingMore && (
              <div className="mt-4 text-center">
                <div className="text-sm text-slate-600">Loading more monitors...</div>
              </div>
            )}
            {!hasMore && monitors.length > 0 && (
              <div className="mt-4 text-center">
                <div className="text-sm text-slate-500">No more monitors to load</div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </>
  )
}
