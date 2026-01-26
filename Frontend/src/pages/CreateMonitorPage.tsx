import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCreateMonitor, type CreateMonitorInput } from '../lib/api'
import { getAuth, resolvePlan } from '../lib/auth'
import { normalizePlanId, PLANS } from '../utils/plans'
import { Seo } from '../components/Seo'

export function CreateMonitorPage() {
  const navigate = useNavigate()
  const { token } = getAuth()

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [method, setMethod] = useState<CreateMonitorInput['method']>('GET')
  const [requestTime, setRequestTime] = useState(5)
  const [checkInterval, setCheckInterval] = useState(5)

  const [headersText, setHeadersText] = useState('')
  const headers = useMemo(() => {
    const trimmed = headersText.trim()
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
  }, [headersText])

  const planId = normalizePlanId(resolvePlan())
  const canUseHooks = planId === 'pro' || planId === 'business'
  const [hookName, setHookName] = useState('')
  const [hookUrl, setHookUrl] = useState('')
  const hooks = useMemo(() => {
    if (!canUseHooks) return undefined
    const name = hookName.trim()
    const url = hookUrl.trim()
    if (!name || !url) return undefined
    return { [name]: url } as Record<string, string>
  }, [canUseHooks, hookName, hookUrl])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const warnings = useMemo(() => {
    const spec = PLANS[planId]
    const list: string[] = []

    if (method && !spec.allowedMethods.includes(method as any)) {
      list.push(`Your plan (${spec.name}) does not allow this HTTP method.`)
    }

    if (Number(requestTime) > spec.maxRequestTimeoutSeconds) {
      list.push(`Your plan (${spec.name}) allows up to ${spec.maxRequestTimeoutSeconds}s request timeout.`)
    }

    if (Number(checkInterval) < spec.minCheckIntervalMinutes) {
      list.push(`Your plan (${spec.name}) requires at least ${spec.minCheckIntervalMinutes} minutes between checks.`)
    }

    const hdr = headers ?? {}
    for (const key of Object.keys(hdr)) {
      if (!spec.allowHeaders.includes(key)) {
        list.push(`Header "${key}" is not allowed on your plan (${spec.name}).`)
      }
    }

    return list
  }, [method, requestTime, checkInterval, headers])

  return (
    <>
      <Seo title="Create monitor" description="Create a new uptime monitor." noindex />
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Create monitor</h1>
            <p className="mt-1 text-sm text-slate-600">Configure a new uptime check.</p>
          </div>
        </div>

        <form
          className="mt-6 grid gap-5"
          onSubmit={async (e) => {
            e.preventDefault()
            setError(null)
            setDone(false)
            setLoading(true)
            try {
              await apiCreateMonitor({
                url,
                name,
                method,
                requestTime: Number(requestTime),
                checkInterval: Number(checkInterval),
                headers,
                hooks,
              })
              setDone(true)
              navigate('/dashboard', { replace: true })
            } catch (err: any) {
              setError(err?.message ?? 'Failed to create monitor')
            } finally {
              setLoading(false)
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">Monitor Name</label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Website Monitor"
              type="text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">URL</label>
            <input
              className="ui-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/health"
              type="url"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Method</label>
              <select
                className="ui-input"
                value={method}
                onChange={(e) => setMethod(e.target.value as CreateMonitorInput['method'])}
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Request timeout (seconds)</label>
              <input
                className="ui-input"
                value={requestTime}
                onChange={(e) => setRequestTime(Number(e.target.value))}
                type="number"
                min={1}
                step={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Check interval (minutes)</label>
            <input
              className="ui-input"
              value={checkInterval}
              onChange={(e) => setCheckInterval(Number(e.target.value))}
              type="number"
              min={1}
              step={1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Headers (optional)</label>
            <textarea
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder="X-Api-Key: ...\nAuthorization: ..."
              rows={5}
            />
            <p className="mt-1 text-xs text-slate-500">One header per line: Key: Value</p>
          </div>

          {canUseHooks ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Webhooks</div>
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
              <div className="mt-2 text-xs text-slate-500">
                Leave both fields empty to create the monitor without webhooks.
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Webhooks are available on Pro and Business plans.
            </div>
          )}

          {warnings.length ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <div className="font-medium">Plan warning</div>
              <ul className="mt-1 list-disc pl-5">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {done ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Monitor created.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="ui-btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              className="ui-btn-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  )
}
