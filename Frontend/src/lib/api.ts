type ApiError = {
  status: number
  message: string
}

type ApiRequestOptions = RequestInit & {
  auth?: boolean
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('axiscloud_token')
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

async function request<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  const url = `${getBaseUrl()}${path}`

  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (init?.auth) {
    const authHeader = getAuthHeader() as Record<string, string>
    for (const [k, v] of Object.entries(authHeader)) headers.set(k, v)
  }

  const res = await fetch(url, {
    ...init,
    headers,
  })

  if (!res.ok) {
    const data = await parseJsonSafe(res)
    const message = (data && (data.message || data.error?.message)) || res.statusText || 'Request failed'
    const err: ApiError = { status: res.status, message }
    throw err
  }

  const data = await parseJsonSafe(res)
  return data as T
}

export type AuthResponse = {
  token: string
  success: boolean
  username: string
  plan?: string
  plain?: string
}

export async function apiRegister(input: {
  username: string
  email: string
  password: string
}) {
  return request<AuthResponse>('/CreateUser', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function apiLogin(input: { email: string; password: string }) {
  return request<AuthResponse>('/Login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type HomeUserData = {
  _id?: string
  username: string
  role: string
  plan: string
}

export type HomeResponse = {
  websiteData: number[]
  userData: HomeUserData | null
  logsCount: number
  monitorsCount: number
}

export async function apiGetHome() {
  const data = await request<{ websiteData: number[]; userData: HomeUserData | null }>('/GetHome', {
    method: 'GET',
    auth: true,
  })

  const logsCount = Number(data.websiteData?.[0] ?? 0)
  const monitorsCount = Number(data.websiteData?.[1] ?? 0)

  return {
    ...data,
    logsCount: Number.isFinite(logsCount) ? logsCount : 0,
    monitorsCount: Number.isFinite(monitorsCount) ? monitorsCount : 0,
  } satisfies HomeResponse
}

export async function apiCreateCode(input: { email: string }) {
  return request<unknown>('/CreateCode', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function apiCheckCode(token: string) {
  return request<unknown>(`/CheckCode?token=${encodeURIComponent(token)}`, {
    method: 'POST',
  })
}

export async function apiUpdatePassword(token: string, input: { password: string }) {
  return request<unknown>(`/UpdatePassword?token=${encodeURIComponent(token)}`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type CreateMonitorInput = {
  url: string
  method: 'GET' | 'HEAD' | 'POST'
  requestTime: number
  checkInterval: number
  headers?: Record<string, string>
  name: string
  hooks?: Record<string, string>
}

export async function apiCreateMonitor(input: CreateMonitorInput) {
  return request<unknown>('/CreateMontior', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input),
  })
}

export type UpdateMonitorInput = {
  name?: string
  url?: string
  checkInterval?: number
  requestTime?: number
  method?: 'GET' | 'HEAD' | 'POST'
  headers?: Record<string, string>
  isActive?: boolean
  isAlerts?: boolean
  hooks?: Record<string, string>
}

export async function apiUpdateMonitor(montiorId: string, input: UpdateMonitorInput) {
  return request<{ updateMontior: Monitor }>(`/UpdateMontior/${encodeURIComponent(montiorId)}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(input),
  })
}

export async function apiDeleteMonitor(montiorId: string) {
  return request<unknown>(`/DeleteMontior/${encodeURIComponent(montiorId)}`, {
    method: 'DELETE',
    auth: true,
  })
}

export async function apiDeleteWebhookField(serivceId: string, input: { hookName: string }) {
  return request<unknown>(`/deleteFeildWebHook/${encodeURIComponent(serivceId)}`, {
    method: 'DELETE',
    auth: true,
    body: JSON.stringify(input),
  })
}

export async function apiDeleteAllWebhookFields(serivceId: string) {
  return request<unknown>(`/deleteAllFeildsWebHook/${encodeURIComponent(serivceId)}`, {
    method: 'DELETE',
    auth: true,
  })
}

export async function apiTestUptime(url: string) {
  return request<{statusCode: number, headers: Record<string, string>, url: string}>('/testUpTime', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ url }),
  })
}

export type MonitorLog = {
  _id: string
  montiorId: string
  status: string
  httpStatus: number
  responseTime: number
  createdAt: string
  updatedAt: string
}

export type MonitorWebHook = {
  hooks: Record<string, string>
}

export type Monitor = {
  _id: string
  userId: string
  url: string
  method: string
  requestTime: number
  isActive: boolean
  checkInterval: number
  Headers: Record<string, string>
  checkAt: number
  plan: string
  name: string
  slug: string
  status: string
  isAlerts: boolean
  createdAt: string
  updatedAt: string
}

export async function apiGetMonitors(params?: { skip?: number; sort?: string }) {
  const queryParams = new URLSearchParams()
  if (typeof params?.skip === 'number') queryParams.append('skip', params.skip.toString())
  if (params?.sort) queryParams.append('sort', params.sort)
  
  const queryString = queryParams.toString()
  const url = `/GetMontiors${queryString ? `?${queryString}` : ''}`
  
  return request<{montiors: Monitor[]}>(
    url, {
    method: 'GET',
    auth: true,
  })
}

export async function apiGetMonitor(slug: string, params?: { skip?: number; sort?: string }) {
  const queryParams = new URLSearchParams()
  if (typeof params?.skip === 'number') queryParams.append('skip', params.skip.toString())
  if (params?.sort) queryParams.append('sort', params.sort)
  
  const queryString = queryParams.toString()
  const url = `/montior/${slug}${queryString ? `?${queryString}` : ''}`
  
  return request<{montior: Monitor, logs: MonitorLog[], webHook?: MonitorWebHook | null}>(
    url, {
    method: 'GET',
    auth: true,
  })
}

export type PaypalLink = {
  href: string
  rel: string
  method?: string
}

export type PaypalCreateOrderResponse = {
  id: string
  status?: string
  links?: PaypalLink[]
}

export async function apiUpgradePro(input?: { serivce?: 'pro' | 'business' }) {
  return request<PaypalCreateOrderResponse>('/payment/upgradePro', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input ?? {}),
  })
}

export async function apiCapturePaypalOrder(input: { id: string }) {
  return request<unknown>('/payment/CaptureOrder', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input),
  })
}
