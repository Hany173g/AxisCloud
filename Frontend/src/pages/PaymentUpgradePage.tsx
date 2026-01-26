import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUpgradePro, type PaypalCreateOrderResponse } from '../lib/api'
import { getAuth, resolvePlan } from '../lib/auth'
import { normalizePlanId, PLANS, type PlanFeature, type PlanId } from '../utils/plans'

function findApprovalUrl(order: PaypalCreateOrderResponse) {
  const links = order.links ?? []
  const approval = links.find((l) => l.rel === 'approve')
  return approval?.href || null
}

export function PaymentUpgradePage() {
  const navigate = useNavigate()
  const { token } = getAuth()

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  const currentPlanId = useMemo(() => normalizePlanId(resolvePlan()), [])
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeFeature, setActiveFeature] = useState<PlanFeature | null>(null)

  async function startCheckout(plan: Exclude<PlanId, 'free'>) {
    setError(null)
    setLoadingPlan(plan)
    try {
      sessionStorage.setItem('axiscloud_pending_upgrade_plan', plan)
      const result = await apiUpgradePro({ serivce: plan })
      const url = findApprovalUrl(result)
      if (!url) {
        setError('Could not start PayPal checkout.')
        return
      }
      window.location.href = url
    } catch (err: any) {
      sessionStorage.removeItem('axiscloud_pending_upgrade_plan')
      setError(err?.message ?? 'Failed to start checkout')
    } finally {
      setLoadingPlan(null)
    }
  }

  const priceLabel: Record<PlanId, string> = {
    free: '$0',
    pro: '$50',
    business: '$100',
  }

  const priceSuffix: Record<PlanId, string> = {
    free: 'forever',
    pro: 'month',
    business: 'month',
  }

  const planOrder: PlanId[] = ['free', 'pro', 'business']

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-10 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-100/40 via-emerald-100/30 to-sky-100/30 blur-3xl" />
      </div>
      {loadingPlan ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="text-sm font-semibold text-slate-950">Redirecting to PayPal…</div>
            <div className="mt-2 text-sm text-slate-600">Please complete the payment to finish your upgrade.</div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-brand-800" />
            </div>
          </div>
        </div>
      ) : null}

      {activeFeature ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="text-sm font-semibold text-slate-950">{activeFeature.title}</div>
            <div className="mt-2 text-sm text-slate-600">{activeFeature.description}</div>
            <div className="mt-4 flex justify-end">
              <button type="button" className="ui-btn-secondary" onClick={() => setActiveFeature(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Choose your plan</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Upgrade in seconds. Pay securely with PayPal and unlock higher limits instantly.
            </p>
          </div>
          <div className="text-sm text-slate-600">
            Current plan:{' '}
            <span className="font-semibold text-slate-900">{PLANS[currentPlanId].name}</span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {planOrder.map((id) => {
            const spec = PLANS[id]
            const isCurrent = id === currentPlanId
            const isFeatured = id === 'pro'
            const isPaid = id !== 'free'
            const isDowngrade = currentPlanId !== 'free' && id === 'free'
            const canUpgrade = !isCurrent && !isDowngrade
            const busy = loadingPlan === id

            return (
              <div
                key={id}
                className={
                  'relative rounded-3xl border p-6 shadow-sm transition ' +
                  (isFeatured
                    ? 'border-brand-200 bg-gradient-to-b from-brand-50/70 to-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md')
                }
              >
                {isFeatured ? (
                  <div className="absolute -top-3 left-4 rounded-full bg-brand-800 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Most popular
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">{spec.name}</div>
                  {isCurrent ? (
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">Current</span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <div className="text-3xl font-semibold tracking-tight text-slate-950">{priceLabel[id]}</div>
                  <div className="text-sm text-slate-600">/{priceSuffix[id]}</div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {spec.features.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left hover:bg-slate-50"
                        onClick={() => setActiveFeature(f)}
                      >
                        {f.included ? (
                          <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M20 6L9 17l-5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-100 text-red-700">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        <span className="min-w-0">
                          <div className="text-sm font-medium text-slate-800">{f.title}</div>
                          <div className="text-xs text-slate-600">{f.summary}</div>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isPaid ? (
                    <button
                      type="button"
                      className={isFeatured ? 'ui-btn-primary w-full' : 'ui-btn-secondary w-full'}
                      disabled={!canUpgrade || !!loadingPlan}
                      onClick={() => startCheckout(id as Exclude<PlanId, 'free'>)}
                    >
                      {isCurrent ? 'Current plan' : busy ? 'Redirecting…' : canUpgrade ? 'Upgrade' : 'Not available'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ui-btn-secondary w-full"
                      disabled={isCurrent || !!loadingPlan}
                      onClick={() => navigate('/dashboard')}
                    >
                      {isCurrent ? 'Current plan' : 'Continue with Free'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {error ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-6">
          <button type="button" className="ui-btn-secondary" onClick={() => navigate('/dashboard')} disabled={!!loadingPlan}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
