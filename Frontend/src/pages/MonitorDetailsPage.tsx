import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  apiGetMonitor,
  apiUpdateMonitor,
  apiDeleteMonitor,
  apiDeleteAllWebhookFields,
  apiDeleteWebhookField,
  type Monitor,
  type MonitorLog,
  type MonitorWebHook,
  type UpdateMonitorInput,
} from '../lib/api'
import { getAuth } from '../lib/auth'

export function MonitorDetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { token } = getAuth()
  const [monitor, setMonitor] = useState<Monitor | null>(null)
  const [logs, setLogs] = useState<MonitorLog[]>([])
  const [webHook, setWebHook] = useState<MonitorWebHook | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skip, setSkip] = useState(0)
  const [sort, setSort] = useState<'-createdAt' | 'createdAt'>('-createdAt')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editMethod, setEditMethod] = useState<'GET' | 'HEAD' | 'POST'>('GET')
  const [editCheckInterval, setEditCheckInterval] = useState<number>(5)
  const [editRequestTime, setEditRequestTime] = useState<number>(5)
  const [editHeadersText, setEditHeadersText] = useState('')
  const [editIsActive, setEditIsActive] = useState<boolean>(true)
  const [editIsAlerts, setEditIsAlerts] = useState<boolean>(true)
 
  const canUseHooks =
    String(monitor?.plan ?? '').toLowerCase() === 'pro' || String(monitor?.plan ?? '').toLowerCase() === 'business'
  const [hookName, setHookName] = useState('')
  const [hookUrl, setHookUrl] = useState('')
  const [hookActionLoading, setHookActionLoading] = useState(false)
  const [hookError, setHookError] = useState<string | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLogRef = useRef<HTMLTableRowElement | null>(null)

  const fetchMonitorAndLogs = useCallback(async (skipCount: number, isLoadMore: boolean, sortValue: '-createdAt' | 'createdAt') => {
    try {
      if (!slug) throw new Error('Monitor slug is required')
      setError(null)
      
      if (isLoadMore) {
        setLoadingMore(true)
        const data = await apiGetMonitor(slug, { skip: skipCount, sort: sortValue })
        setLogs(prev => [...prev, ...data.logs])
        setHasMore(data.logs.length === 10)
      } else {
        setLoading(true)
        const data = await apiGetMonitor(slug, { skip: skipCount, sort: sortValue })
        setMonitor(data.montior)
        setLogs(data.logs || [])
        setWebHook(data.webHook ?? null)
        setHasMore((data.logs || []).length === 10)

        // Keep edit form in sync with latest monitor when not actively editing
        if (!editing) {
          setEditName(data.montior.name ?? '')
          setEditUrl(data.montior.url ?? '')
          const m = String(data.montior.method ?? 'GET').toUpperCase()
          setEditMethod(m === 'POST' ? 'POST' : m === 'HEAD' ? 'HEAD' : 'GET')
          setEditCheckInterval(Number(data.montior.checkInterval ?? 5))
          setEditRequestTime(Number(data.montior.requestTime ?? 5))
          setEditIsActive(Boolean(data.montior.isActive))
          setEditIsAlerts(Boolean(data.montior.isAlerts))
          const hdr = data.montior.Headers ?? {}
          setEditHeadersText(
            Object.entries(hdr)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n')
          )
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch monitor')
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }, [slug, editing])

  const buildHeadersObject = (text: string): Record<string, string> | undefined => {
    const trimmed = text.trim()
    if (!trimmed) return undefined

    const out: Record<string, string> = {}
    for (const line of trimmed.split(/\r?\n/)) {
      const idx = line.indexOf(':')
      if (idx <= 0) continue
      const key = line.slice(0, idx).trim()
      const value = line.slice(idx + 1).trim()
      if (!key) continue
      out[key] = value
    }

    return Object.keys(out).length ? out : undefined
  }

  const normalizeMethod = (value: unknown): 'GET' | 'HEAD' | 'POST' => {
    const m = String(value ?? 'GET').toUpperCase()
    if (m === 'HEAD') return 'HEAD'
    if (m === 'POST') return 'POST'
    return 'GET'
  }

  const normalizeHeaders = (headers: unknown): Record<string, string> => {
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) return {}
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(headers as Record<string, unknown>)) {
      if (typeof v === 'string') out[k] = v
      else if (v != null) out[k] = String(v)
    }
    return out
  }

  const areHeadersEqual = (a: Record<string, string>, b: Record<string, string>) => {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    for (const k of aKeys) {
      if (a[k] !== b[k]) return false
    }
    return true
  }

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string
    description?: string
    checked: boolean
    onChange: (next: boolean) => void
  }) => {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          {description ? <div className="mt-0.5 text-xs text-slate-500">{description}</div> : null}
        </div>
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            checked ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
          aria-pressed={checked}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    if (!slug) {
      setError('Monitor slug is required')
      setLoading(false)
      return
    }

    setLogs([])
    setSkip(0)
    setHasMore(true)
    fetchMonitorAndLogs(0, false, sort)
  }, [token, slug, navigate, fetchMonitorAndLogs, sort])

  useEffect(() => {
    if (loadingMore || !hasMore || !monitor) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const newSkip = skip + 10
          setSkip(newSkip)
          fetchMonitorAndLogs(newSkip, true, sort)
        }
      },
      { threshold: 0.1 }
    )

    if (lastLogRef.current) {
      observerRef.current.observe(lastLogRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadingMore, hasMore, skip, fetchMonitorAndLogs, monitor, logs, sort])

  useEffect(() => {
    setHookName('')
    setHookUrl('')
    setHookError(null)
    setHookActionLoading(false)
  }, [monitor?._id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">Loading monitor details...</div>
      </div>
    )
  }

  if (error || !monitor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || 'Monitor not found'}
        </div>
        <Link
          className="ui-btn-secondary mt-4"
          to="/monitors"
        >
          Back to Monitors
        </Link>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {monitor.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor details and configuration.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="ui-btn-secondary border-red-200 text-red-700 hover:bg-red-50"
              disabled={saving || deleting}
              onClick={async () => {
                if (!monitor?._id) return
                setDeleteError(null)
                setShowDeleteModal(true)
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <button
              type="button"
              className="ui-btn-secondary"
              onClick={() => {
                setSaveError(null)
                setDeleteError(null)
                if (!editing) {
                  setEditName(monitor.name ?? '')
                  setEditUrl(monitor.url ?? '')
                  const m = String(monitor.method ?? 'GET').toUpperCase()
                  setEditMethod(m === 'POST' ? 'POST' : m === 'HEAD' ? 'HEAD' : 'GET')
                  setEditCheckInterval(Number(monitor.checkInterval ?? 5))
                  setEditRequestTime(Number(monitor.requestTime ?? 5))
                  setEditIsActive(Boolean(monitor.isActive))
                  setEditIsAlerts(Boolean(monitor.isAlerts))
                  const hdr = monitor.Headers ?? {}
                  setEditHeadersText(
                    Object.entries(hdr)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('\n')
                  )
                }
                setEditing(!editing)
              }}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <Link
              className="ui-btn-secondary"
              to="/monitors"
            >
              Back
            </Link>
          </div>
        </div>

        {deleteError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</div>
        ) : null}

        {showDeleteModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="text-base font-semibold text-slate-900">Delete monitor?</div>
              <div className="mt-2 text-sm text-slate-600">
                This will permanently delete this monitor and its logs. <span className="font-medium text-slate-900">Monitor data will not be recoverable.</span>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="ui-btn-secondary"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ui-btn-secondary border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  disabled={deleting}
                  onClick={async () => {
                    if (!monitor?._id) return
                    setDeleteError(null)
                    setDeleting(true)
                    try {
                      await apiDeleteMonitor(monitor._id)
                      setShowDeleteModal(false)
                      navigate('/monitors', { replace: true })
                    } catch (err: any) {
                      setDeleteError(err?.message ?? 'Failed to delete monitor')
                    } finally {
                      setDeleting(false)
                    }
                  }}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {editing && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Edit Monitor</h3>
            <form
              className="mt-4 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!monitor?._id) return

                setSaving(true)
                setSaveError(null)
                try {
                  const current = monitor
                  const nextHeaders = buildHeadersObject(editHeadersText) ?? {}
                  const currentHeaders = normalizeHeaders(current.Headers)

                  const payload: UpdateMonitorInput = {}
                  if ((editName ?? '') !== (current.name ?? '')) payload.name = editName
                  if ((editUrl ?? '') !== (current.url ?? '')) payload.url = editUrl

                  const nextMethod = normalizeMethod(editMethod)
                  const currentMethod = normalizeMethod(current.method)
                  if (nextMethod !== currentMethod) payload.method = nextMethod

                  const nextCheckInterval = Number(editCheckInterval)
                  if (Number.isFinite(nextCheckInterval) && nextCheckInterval !== Number(current.checkInterval)) {
                    payload.checkInterval = nextCheckInterval
                  }

                  const nextRequestTime = Number(editRequestTime)
                  if (Number.isFinite(nextRequestTime) && nextRequestTime !== Number(current.requestTime)) {
                    payload.requestTime = nextRequestTime
                  }

                  if (Boolean(editIsActive) !== Boolean(current.isActive)) {
                    payload.isActive = Boolean(editIsActive)
                  }

                  if (Boolean(editIsAlerts) !== Boolean(current.isAlerts)) {
                    payload.isAlerts = Boolean(editIsAlerts)
                  }

                  if (!areHeadersEqual(nextHeaders, currentHeaders)) {
                    payload.headers = nextHeaders
                  }

                  if (Object.keys(payload).length === 0) {
                    setEditing(false)
                    return
                  }

                  await apiUpdateMonitor(monitor._id, payload)
                  setEditing(false)

                  // After successful update, refetch to keep UI consistent with backend response
                  setLogs([])
                  setSkip(0)
                  setHasMore(true)
                  fetchMonitorAndLogs(0, false, sort)
                } catch (err: any) {
                  setSaveError(err?.message ?? 'Failed to update monitor')
                } finally {
                  setSaving(false)
                }
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  label="Monitor Active"
                  description="Controls whether this monitor is enabled (counts active/inactive)."
                  checked={editIsActive}
                  onChange={setEditIsActive}
                />
                <Toggle
                  label="Alerts"
                  description="Enable/disable alerts for this monitor."
                  checked={editIsAlerts}
                  onChange={setEditIsAlerts}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Name</label>
                  <input
                    className="ui-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Method</label>
                  <select
                    className="ui-input"
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value as any)}
                  >
                    <option value="GET">GET</option>
                    <option value="HEAD">HEAD</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">URL</label>
                <input
                  className="ui-input"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  type="url"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Check Interval (minutes)</label>
                  <input
                    className="ui-input"
                    value={editCheckInterval}
                    onChange={(e) => setEditCheckInterval(Number(e.target.value))}
                    type="number"
                    min={1}
                    step={1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Request Timeout (seconds)</label>
                  <input
                    className="ui-input"
                    value={editRequestTime}
                    onChange={(e) => setEditRequestTime(Number(e.target.value))}
                    type="number"
                    min={1}
                    step={1}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Headers</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  value={editHeadersText}
                  onChange={(e) => setEditHeadersText(e.target.value)}
                  placeholder="Accept: application/json\nAuthorization: Bearer ..."
                  rows={5}
                />
              </div>

              {saveError ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>
              ) : null}

              <div className="flex gap-3">
                <button type="submit" className="ui-btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="ui-btn-secondary"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false)
                    setSaveError(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 grid gap-6">
          {canUseHooks ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Webhooks</h3>
                  <div className="mt-0.5 text-xs text-slate-500">Manage status change notifications.</div>
                </div>
                {editing ? (
                  <button
                    type="button"
                    className="ui-btn-secondary border-red-200 text-red-700 hover:bg-red-50"
                    disabled={hookActionLoading}
                    onClick={async () => {
                      if (!monitor?._id) return
                      setHookError(null)
                      setHookActionLoading(true)
                      try {
                        await apiDeleteAllWebhookFields(monitor._id)
                        await fetchMonitorAndLogs(0, false, sort)
                        setHookName('')
                        setHookUrl('')
                      } catch (err: any) {
                        setHookError(err?.message ?? 'Failed to delete all webhook fields')
                      } finally {
                        setHookActionLoading(false)
                      }
                    }}
                  >
                    Delete all
                  </button>
                ) : null}
              </div>

              {webHook?.hooks && Object.keys(webHook.hooks).length ? (
                <div className="mt-3">
                  <div className="text-xs font-medium text-slate-700">Current hooks</div>
                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {Object.entries(webHook.hooks).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-start justify-between gap-3 border-b border-slate-200 px-3 py-2 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
                              {k}
                            </span>
                          </div>
                          <a
                            href={v}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block break-all text-xs text-slate-600 hover:text-brand-600"
                          >
                            {v}
                          </a>
                        </div>
                        {editing ? (
                          <button
                            type="button"
                            className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            disabled={hookActionLoading}
                            aria-label={`Delete hook ${k}`}
                            onClick={async () => {
                              if (!monitor?._id) return
                              setHookError(null)
                              setHookActionLoading(true)
                              try {
                                await apiDeleteWebhookField(monitor._id, { hookName: k })
                                await fetchMonitorAndLogs(0, false, sort)
                              } catch (err: any) {
                                setHookError(err?.message ?? 'Failed to delete webhook field')
                              } finally {
                                setHookActionLoading(false)
                              }
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-600">No webhooks configured.</div>
              )}

              {editing ? (
                <>
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="text-xs font-medium text-slate-700">Add / update a field</div>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Hook name</label>
                        <input
                          className="ui-input"
                          value={hookName}
                          onChange={(e) => setHookName(e.target.value)}
                          placeholder="down"
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Hook URL</label>
                        <input
                          className="ui-input"
                          value={hookUrl}
                          onChange={(e) => setHookUrl(e.target.value)}
                          placeholder="https://hooks.slack.com/..."
                          type="url"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="ui-btn-primary"
                        disabled={hookActionLoading || !hookName.trim() || !hookUrl.trim()}
                        onClick={async () => {
                          if (!monitor?._id) return
                          const name = hookName.trim()
                          const url = hookUrl.trim()
                          if (!name || !url) {
                            setHookError('Hook name and URL are required')
                            return
                          }
                          setHookError(null)
                          setHookActionLoading(true)
                          try {
                            await apiUpdateMonitor(monitor._id, { hooks: { [name]: url } })
                            await fetchMonitorAndLogs(0, false, sort)
                            setHookName('')
                            setHookUrl('')
                          } catch (err: any) {
                            setHookError(err?.message ?? 'Failed to update webhook field')
                          } finally {
                            setHookActionLoading(false)
                          }
                        }}
                      >
                        {hookActionLoading ? 'Saving…' : 'Save field'}
                      </button>
                    </div>
                  </div>

                  {hookError ? (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{hookError}</div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-900">Active</h3>
              <div className="mt-1">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  monitor.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {monitor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">Status</h3>
              <div className="mt-1">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  String(monitor.status).toLowerCase() === 'up'
                    ? 'bg-emerald-100 text-emerald-700'
                    : String(monitor.status).toLowerCase() === 'down'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {monitor.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">Method</h3>
              <div className="mt-1">
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {monitor.method}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">Check Interval</h3>
              <p className="mt-1 text-sm text-slate-600">{monitor.checkInterval} minutes</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">Request Timeout</h3>
              <p className="mt-1 text-sm text-slate-600">{monitor.requestTime} seconds</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">Plan</h3>
              <p className="mt-1 text-sm text-slate-600 capitalize">{monitor.plan}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900">Last Check</h3>
              <p className="mt-1 text-sm text-slate-600">
                {monitor.checkAt ? formatDate(monitor.checkAt.toString()) : 'Never'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-900">URL</h3>
            <div className="mt-1">
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-brand-600 break-all"
              >
                {monitor.url}
              </a>
            </div>
          </div>

          {monitor.Headers && Object.keys(monitor.Headers).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-900">Custom Headers</h3>
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                <pre className="text-xs text-slate-700">
                  {Object.entries(monitor.Headers)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')}
                </pre>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium text-slate-900">Monitor Logs</h3>
                <div className="flex items-center gap-2">
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
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-2 text-left font-medium text-slate-900">Time</th>
                      <th className="pb-2 text-left font-medium text-slate-900">Status</th>
                      <th className="pb-2 text-left font-medium text-slate-900">HTTP Status</th>
                      <th className="pb-2 text-left font-medium text-slate-900">Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr 
                        key={log._id} 
                        className="border-b border-slate-100"
                        ref={index === logs.length - 1 ? lastLogRef : null}
                      >
                        <td className="py-2 text-xs text-slate-600">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            log.status === 'success' || log.status === 'up' || log.status.toLowerCase() === 'up'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            log.httpStatus >= 200 && log.httpStatus < 300
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.httpStatus >= 400
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {log.httpStatus}
                          </span>
                        </td>
                        <td className="py-2 text-slate-600">
                          {log.responseTime}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loadingMore && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-slate-600">Loading more logs...</div>
                </div>
              )}
              {!hasMore && logs.length > 0 && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-slate-500">No more logs to load</div>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 text-xs text-slate-500">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {formatDate(monitor.createdAt)}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {formatDate(monitor.updatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
