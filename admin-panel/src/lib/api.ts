export interface UserRecord {
  uid?: string
  id?: string
  email?: string
  fullName?: string
  displayName?: string
  birthDate?: string
  gender?: string
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

export interface AuditLogRecord {
  id: string
  actorEmail: string
  actorRole: string
  action: string
  entityType: string
  entityId?: string | null
  before?: unknown
  after?: unknown
  createdAt: string
}

export interface CategoryRecord {
  id: string
  nameTr: string
  nameEn: string
  sortOrder: number
  isActive: boolean
}

type ApiEnvelope<T> = {
  status: number
  data?: T
  error?: string
}

type PaginatedResult<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '')
const ADMIN_TOKEN_KEY = 'admin_token'

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
  const token = api.getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

const asItems = <T>(data: T[] | PaginatedResult<T>): T[] => {
  if (Array.isArray(data)) return data
  return data.items || []
}

export const api = {
  baseUrl: API_BASE_URL,
  getToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),

  adminLogin: (email: string, password: string) =>
    request<{ token: string; tokenType: string; expiresIn: number; admin: { email: string; role: string } }>(
      '/admin/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    ),

  adminMe: () => request<{ email: string; role: string; exp: number }>('/admin/auth/me'),

  getDashboardSummary: () => request<DashboardSummary>('/admin/dashboard'),

  getUsers: (params?: { role?: 'buyer' | 'seller'; q?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: 'asc' | 'desc'; limit?: number }) =>
    request<UserRecord[] | PaginatedResult<UserRecord>>(`/admin/users${buildQuery(params)}`).then(asItems),

  getUser: (id: string) => request<UserRecord>(`/admin/users/${encodeURIComponent(id)}`),
  updateUser: (id: string, payload: Record<string, unknown>) =>
    request<UserRecord>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteUser: (id: string) =>
    request<{ uid: string }>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  updateSeller: (id: string, payload: Record<string, unknown>) =>
    request<UserRecord>(`/admin/sellers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteSeller: (id: string) =>
    request<{ uid: string }>(`/admin/sellers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getOrders: (params?: { status?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: 'asc' | 'desc'; limit?: number }) =>
    request<OrderRecord[] | PaginatedResult<OrderRecord>>(`/admin/orders${buildQuery(params)}`).then(asItems),
  getOrder: (id: string) => request<OrderRecord>(`/admin/orders/${encodeURIComponent(id)}`),
  createOrder: (payload: Record<string, unknown>) =>
    request<OrderRecord>('/admin/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateOrder: (id: string, payload: Record<string, unknown>) =>
    request<OrderRecord>(`/admin/orders/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updateOrderStatus: (id: string, status: string) =>
    request<{ id: string; status: string }>(`/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteOrder: (id: string) =>
    request<{ id: string }>(`/admin/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getFoods: (params?: { page?: number; pageSize?: number; sortBy?: string; sortDir?: 'asc' | 'desc'; q?: string; limit?: number }) =>
    request<Record<string, unknown>[] | PaginatedResult<Record<string, unknown>>>(`/admin/foods${buildQuery(params || { limit: 300 })}`).then(asItems),
  getCategories: (params?: { activeOnly?: boolean }) =>
    request<CategoryRecord[]>(
      `/admin/categories${buildQuery({
        activeOnly: params?.activeOnly === false ? 'false' : 'true',
      })}`
    ),
  getFood: (id: string) => request<Record<string, unknown>>(`/admin/foods/${encodeURIComponent(id)}`),
  createFood: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>('/admin/foods', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateFood: (id: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/admin/foods/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteFood: (id: string) =>
    request<{ id: string }>(`/admin/foods/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getReviews: (params?: { page?: number; pageSize?: number; sortDir?: 'asc' | 'desc'; limit?: number }) =>
    request<Record<string, unknown>[] | PaginatedResult<Record<string, unknown>>>(`/admin/reviews${buildQuery(params || { limit: 300 })}`).then(asItems),
  getReview: (id: string) => request<Record<string, unknown>>(`/admin/reviews/${encodeURIComponent(id)}`),
  createReview: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>('/admin/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateReview: (id: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteReview: (id: string) =>
    request<{ id: string }>(`/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getChats: (params?: { page?: number; pageSize?: number; sortDir?: 'asc' | 'desc'; limit?: number }) =>
    request<Record<string, unknown>[] | PaginatedResult<Record<string, unknown>>>(`/admin/chats${buildQuery(params || { limit: 300 })}`).then(asItems),
  getChat: (id: string) => request<Record<string, unknown>>(`/admin/chats/${encodeURIComponent(id)}`),
  createChat: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>('/admin/chats', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateChat: (id: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/admin/chats/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteChat: (id: string) =>
    request<{ id: string }>(`/admin/chats/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getMedia: (params?: { page?: number; pageSize?: number; sortDir?: 'asc' | 'desc'; limit?: number }) =>
    request<Record<string, unknown>[] | PaginatedResult<Record<string, unknown>>>(`/admin/media${buildQuery(params || { limit: 300 })}`).then(asItems),
  getMediaById: (id: string) => request<Record<string, unknown>>(`/admin/media/${encodeURIComponent(id)}`),
  createMedia: (payload: Record<string, unknown>) =>
    request<Record<string, unknown>>('/admin/media', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMedia: (id: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/admin/media/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteMedia: (id: string) =>
    request<{ id: string }>(`/admin/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  getAuditLogs: (params?: { limit?: number; entityType?: string; entityId?: string }) =>
    request<AuditLogRecord[] | PaginatedResult<AuditLogRecord>>(`/admin/audit-logs${buildQuery(params)}`).then(asItems),

  getAuditLog: (id: string) => request<AuditLogRecord>(`/admin/audit-logs/${encodeURIComponent(id)}`),
}
