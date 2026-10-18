import { request } from './client'
import type {
  CameraCreate,
  CameraRecord,
  GejalaCreate,
  GejalaRecord,
  HistoryItem,
  User,
} from './types'

export interface LoginInput {
  NIK: string
  password: string
}

export interface RegisterInput {
  NIK: string
  Name: string
  Tgl_lahir: string
  Alamat?: string | null
  id_Role: string
  password: string
}

export const authApi = {
  register: (input: RegisterInput) =>
    request<User>('/auth/register', { method: 'POST', body: input }),
  login: (input: LoginInput) =>
    request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: input,
    }),
  me: () => request<User>('/auth/me'),
}

export const usersApi = {
  list: (signal?: AbortSignal) => request<User[]>('/users', { signal }),
  me: (signal?: AbortSignal) => request<User>('/users/me', { signal }),
  detail: (nik: string, signal?: AbortSignal) =>
    request<User>(`/users/${encodeURIComponent(nik)}`, { signal }),
}

export const gejalaApi = {
  create: (input: GejalaCreate) =>
    request<GejalaRecord>('/gejala', { method: 'POST', body: input }),
  history: (params: { limit?: number; nik?: string } = {}, signal?: AbortSignal) => {
    const q = new URLSearchParams()
    if (params.limit) q.set('limit', String(params.limit))
    if (params.nik) q.set('nik', params.nik)
    const qs = q.toString()
    return request<HistoryItem[]>(`/gejala/history${qs ? `?${qs}` : ''}`, { signal })
  },
  detail: (id: string, signal?: AbortSignal) =>
    request<HistoryItem>(`/gejala/${encodeURIComponent(id)}`, { signal }),
}

export const cameraApi = {
  create: (input: CameraCreate) =>
    request<CameraRecord>('/camera', { method: 'POST', body: input }),
  list: (params: { limit?: number } = {}, signal?: AbortSignal) => {
    const q = new URLSearchParams()
    if (params.limit) q.set('limit', String(params.limit))
    const qs = q.toString()
    return request<CameraRecord[]>(`/camera${qs ? `?${qs}` : ''}`, { signal })
  },
}
