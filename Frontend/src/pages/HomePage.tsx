import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, onAuthChange } from '../lib/auth'
import { apiGetHome } from '../lib/api'
import { Seo } from '../components/Seo'
import { useLanguage } from '../contexts/LanguageContext'

export function HomePage() {
  const { t } = useLanguage()
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
    <>
      <Seo
        title="Uptime monitoring"
        description="AxisCloud is a platform for uptime monitoring and operational alerts."
        canonicalPath="/"
      />
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">{t('banner.beta')}</span>
              <span>{t('banner.beta_text')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('banner.need_help')}</span>
              <a 
                href="https://t.me/AxisCloud" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-md bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30 transition-colors"
              >
                {t('banner.join_community')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <section className="w-full bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 md:text-5xl">
              {t('home.title')}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              {t('home.subtitle')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {loggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    {t('home.dashboard')}
                  </Link>
                  <Link
                    to="/monitors/new"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {t('home.add_monitor')}
                  </Link>
                  <Link
                    to="/monitors"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {t('home.monitors')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    {t('home.start_free')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {t('home.login')}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('home.feature_247')}</div>
                <div className="mt-1 text-sm text-slate-800">{t('home.feature_247_desc')}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('home.feature_alerts')}</div>
                <div className="mt-1 text-sm text-slate-800">{t('home.feature_alerts_desc')}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('home.feature_reports')}</div>
                <div className="mt-1 text-sm text-slate-800">{t('home.feature_reports_desc')}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-50 to-emerald-50" />
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('home.feature_247')}</div>
                  <div className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                    {t('home.feature_247') === 'مراقبة 24/7' ? 'متصل' : 'Active'}
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    https://yourservice.com/api/health
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">GET</div>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">30s</div>
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">24/7</div>
                  </div>
                  <div className="rounded-md bg-emerald-600 px-3 py-2 text-center text-xs font-medium text-white">
                    {t('home.feature_247') === 'مراقبة 24/7' ? 'وقت الاستجابة: 145ms' : 'Response time: 145ms'}
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
              <div className="text-sm font-semibold text-slate-900">{t('home.total_checks')}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{logsCount}</div>
              <div className="mt-1 text-sm text-slate-600">{t('home.total_checks_desc')}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">{t('home.total_monitors')}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{monitorsCount}</div>
              <div className="mt-1 text-sm text-slate-600">{t('home.total_monitors_desc')}</div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">{t('home.performance_checks')}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                {t('home.performance_checks_desc')}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">{t('home.alerts_notifications')}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                {t('home.alerts_notifications_desc')}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold text-slate-900">{t('home.logs_reports')}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">
                {t('home.logs_reports_desc')}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-slate-900">{t('home.ready_to_start')}</div>
              <div className="mt-1 text-sm text-slate-600">
                {loggedIn ? t('home.ready_to_start_logged') : t('home.ready_to_start_guest')}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {loggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    {t('home.dashboard')}
                  </Link>
                  <Link
                    to="/monitors/new"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {t('home.new_monitor_btn')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-md bg-brand-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-900"
                  >
                    {t('home.start_free')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    {t('home.login')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
