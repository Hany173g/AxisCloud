export type PlanId = 'free' | 'pro' | 'business'

export type MonitorMethod = 'GET' | 'HEAD' | 'POST'

export type PlanFeature = {
  id: string
  title: string
  summary: string
  description: string
  included: boolean
}

export type PlanSpec = {
  id: PlanId
  name: string
  maxMonitors: number
  minCheckIntervalMinutes: number
  maxRequestTimeoutSeconds: number
  allowedMethods: MonitorMethod[]
  allowHeaders: string[]
  alertsEnabled: boolean
  webhooksEnabled: boolean
  features: PlanFeature[]
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
    alertsEnabled: true,
    webhooksEnabled: false,
    features: [
      {
        id: 'monitors',
        title: 'Monitors',
        summary: 'Up to 5 monitors',
        description: 'Create up to 5 uptime monitors on the Free plan.',
        included: true,
      },
      {
        id: 'interval',
        title: 'Check interval',
        summary: 'Every 10 minutes',
        description: 'The minimum check interval is 10 minutes. Faster checks require upgrading your plan.',
        included: true,
      },
      {
        id: 'timeout',
        title: 'Request timeout',
        summary: 'Up to 5 seconds',
        description: 'Maximum request timeout is 5 seconds. Increase timeout on higher plans for slower endpoints.',
        included: true,
      },
      {
        id: 'methods',
        title: 'HTTP methods',
        summary: 'GET, HEAD',
        description: 'Supported HTTP methods on Free plan are GET and HEAD.',
        included: true,
      },
      {
        id: 'method_post',
        title: 'POST requests',
        summary: 'Not included',
        description: 'POST request checks are not available on the Free plan. Upgrade to Business to enable POST checks.',
        included: false,
      },
      {
        id: 'headers',
        title: 'Custom headers',
        summary: '2 headers allowed',
        description: 'You can use a limited set of request headers: Accept and Accept-Language.',
        included: true,
      },
      {
        id: 'alerts',
        title: 'Alerts',
        summary: '5 alerts per week',
        description: 'Free plan includes alerts with a limit of 5 alerts per week. Upgrade to Pro or Business for unlimited alerts.',
        included: true,
      },
      {
        id: 'webhooks',
        title: 'Webhooks',
        summary: 'Not included',
        description: 'Webhooks are not available on the Free plan. Upgrade to Pro or Business to enable webhooks.',
        included: false,
      },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxMonitors: 30,
    minCheckIntervalMinutes: 3,
    maxRequestTimeoutSeconds: 10,
    allowedMethods: ['GET', 'HEAD'],
    allowHeaders: ['Accept', 'Accept-Language', 'User-Agent', 'Authorization', 'Cache-Control'],
    alertsEnabled: true,
    webhooksEnabled: true,
    features: [
      {
        id: 'monitors',
        title: 'Monitors',
        summary: 'Up to 30 monitors',
        description: 'Create up to 30 uptime monitors on the Pro plan.',
        included: true,
      },
      {
        id: 'interval',
        title: 'Check interval',
        summary: 'Every 3 minutes',
        description: 'The minimum check interval is 3 minutes. Ideal for faster incident detection.',
        included: true,
      },
      {
        id: 'timeout',
        title: 'Request timeout',
        summary: 'Up to 10 seconds',
        description: 'Maximum request timeout is 10 seconds for slower endpoints.',
        included: true,
      },
      {
        id: 'methods',
        title: 'HTTP methods',
        summary: 'GET, HEAD',
        description: 'Supported HTTP methods on Pro plan are GET and HEAD.',
        included: true,
      },
      {
        id: 'method_post',
        title: 'POST requests',
        summary: 'Not included',
        description: 'POST request checks are only available on the Business plan.',
        included: false,
      },
      {
        id: 'headers',
        title: 'Custom headers',
        summary: '5 headers allowed',
        description: 'You can use common headers like User-Agent, Authorization, and Cache-Control in addition to basic headers.',
        included: true,
      },
      {
        id: 'alerts',
        title: 'Alerts',
        summary: 'Unlimited alerts',
        description: 'Pro plan includes unlimited alerts for status changes.',
        included: true,
      },
      {
        id: 'webhooks',
        title: 'Webhooks',
        summary: 'Included',
        description: 'Send webhook notifications on monitor status changes. Manage webhook fields per monitor.',
        included: true,
      },
    ],
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
      'Accept-Charset',
    ],
    alertsEnabled: true,
    webhooksEnabled: true,
    features: [
      {
        id: 'monitors',
        title: 'Monitors',
        summary: 'Up to 100 monitors',
        description: 'Create up to 100 uptime monitors on the Business plan.',
        included: true,
      },
      {
        id: 'interval',
        title: 'Check interval',
        summary: 'Every 1 minute',
        description: 'The minimum check interval is 1 minute for near real-time monitoring.',
        included: true,
      },
      {
        id: 'timeout',
        title: 'Request timeout',
        summary: 'Up to 15 seconds',
        description: 'Maximum request timeout is 15 seconds to support slow backends.',
        included: true,
      },
      {
        id: 'methods',
        title: 'HTTP methods',
        summary: 'GET, HEAD, POST',
        description: 'Business plan supports GET, HEAD, and POST request methods.',
        included: true,
      },
      {
        id: 'method_post',
        title: 'POST requests',
        summary: 'Included',
        description: 'Business plan supports POST request checks.',
        included: true,
      },
      {
        id: 'headers',
        title: 'Custom headers',
        summary: 'More headers allowed',
        description: 'Business plan allows additional headers such as Origin, I-KEY, Accept-Encoding, and more.',
        included: true,
      },
      {
        id: 'alerts',
        title: 'Alerts',
        summary: 'Unlimited alerts',
        description: 'Business plan includes unlimited alerts for status changes.',
        included: true,
      },
      {
        id: 'webhooks',
        title: 'Webhooks',
        summary: 'Included',
        description: 'Send webhook notifications on monitor status changes. Manage webhook fields per monitor.',
        included: true,
      },
    ],
  },
}

export function normalizePlanId(plan: unknown): PlanId {
  const p = String(plan ?? '').toLowerCase()
  if (p === 'pro') return 'pro'
  if (p === 'business') return 'business'
  return 'free'
}
