export interface UserRecord {
  uid?: string
  id?: string
  email?: string
  displayName?: string
  userType?: string
  status?: string
  [key: string]: unknown
}

export interface OrderRecord {
  id: string
  buyerId?: string
  sellerId?: string
  buyerName?: string
  cookName?: string
  totalPrice?: number
  status?: string
  orderDate?: string
  createdAt?: string
  [key: string]: unknown
}

export interface DashboardSummary {
  users: number
  foods: number
  orders: number
  chats: number
  reviews: number
  media: number
}

type ApiEnvelope<T> = {
  status: number
  data?: T
  error?: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '')

const buildQuery = (params?: Record<string, string | number | undefined>) => {
  if (!params) return ''
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  const text = query.toString()
  return text ? `?${text}` : ''
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || payload.error) {
    throw new Error(payload.error || `Request failed: ${response.status}`)
  }
  return payload.data as T
}

export const api = {
  baseUrl: API_BASE_URL,

  getDashboardSummary: () => request<DashboardSummary>('/admin/dashboard'),

  getUsers: (params?: { role?: 'buyer' | 'seller'; q?: string; limit?: number }) =>
    request<UserRecord[]>(`/admin/users${buildQuery(params)}`),

  getUser: (id: string) => request<UserRecord>(`/admin/users/${encodeURIComponent(id)}`),

  getOrders: (params?: { status?: string; limit?: number }) =>
    request<OrderRecord[]>(`/admin/orders${buildQuery(params)}`),

  updateOrderStatus: (id: string, status: string) =>
    request<{ id: string; status: string }>(`/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getFoods: (limit = 300) => request<Record<string, unknown>[]>(`/admin/foods${buildQuery({ limit })}`),

  getReviews: (limit = 300) => request<Record<string, unknown>[]>(`/admin/reviews${buildQuery({ limit })}`),

  getChats: (limit = 300) => request<Record<string, unknown>[]>(`/admin/chats${buildQuery({ limit })}`),

  getMedia: (limit = 300) => request<Record<string, unknown>[]>(`/admin/media${buildQuery({ limit })}`),
}
