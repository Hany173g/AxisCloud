export type PlanId = 'free' | 'pro' | 'business'

export type MonitorMethod = 'GET' | 'HEAD' | 'POST'

export type PlanSpec = {
  id: PlanId
  name: string
  maxMonitors: number
  minCheckIntervalMinutes: number
  maxRequestTimeoutSeconds: number
  allowedMethods: MonitorMethod[]
  allowHeaders: string[]
}

export const PLANS: Record<PlanId, PlanSpec> = {
  free: {
    id: 'free',
    name: 'Free',
    maxMonitors: 5,
    minCheckIntervalMinutes: 10,
    maxRequestTimeoutSeconds: 5,
    allowedMethods: ['GET', 'HEAD'],
    allowHeaders: ['Accept', 'Accept-Language'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxMonitors: 30,
    minCheckIntervalMinutes: 3,
    maxRequestTimeoutSeconds: 10,
    allowedMethods: ['GET', 'HEAD'],
    allowHeaders: ['Accept', 'Accept-Language', 'User-Agent', 'Authorization', 'Cache-Control'],
  },
  business: {
    id: 'business',
    name: 'Business',
    maxMonitors: 100,
    minCheckIntervalMinutes: 1,
    maxRequestTimeoutSeconds: 15,
    allowedMethods: ['GET', 'HEAD', 'POST'],
    allowHeaders: [
      'Accept',
      'Accept-Language',
      'User-Agent',
      'Authorization',
      'Cache-Control',
      'Origin',
      'I-KEY',
      'Accept-Encoding',
      'Accept-Encodin',
      'Accept-Charset',
    ],
  },
}

export function normalizePlanId(plan: unknown): PlanId {
  const p = String(plan ?? '').toLowerCase()
  if (p === 'pro') return 'pro'
  if (p === 'business') return 'business'
  return 'free'
}
