const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined

// Kosong = mode dev lewat proxy Vite /be-api -> http://localhost:8000.
// Produksi: set VITE_API_BASE_URL ke domain backend (mis. funnel), path tanpa /api.
export const API_BASE = (RAW_BASE && RAW_BASE.trim()) || '/be-api'

const TOKEN_KEY = 'mc.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  fields?: Record<string, string>

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}

// Satu pintu request: header auth, timeout 15 detik, dan pemetaan error
// sesuai tabel kode status di Documentation.md.
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  if (opts.signal) {
    opts.signal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  const token = getToken()
  const headers: Record<string, string> = {}
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (opts.signal?.aborted || controller.signal.aborted) {
      throw new DOMException('Request dibatalkan', 'AbortError')
    }
    throw err
  }
  clearTimeout(timer)

  if (res.status === 204) return undefined as T

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    throw describeError(res.status, data)
  }
  return data as T
}

export function describeError(status: number, data: unknown): ApiError {
  const obj = (data ?? {}) as Record<string, unknown>
  let message: string
  const fields: Record<string, string> = {}

  if (status === 422 && Array.isArray(obj.detail)) {
    for (const item of obj.detail as { loc?: (string | number)[]; msg?: string }[]) {
      const key = String(item.loc?.[item.loc.length - 1] ?? '')
      if (key) fields[key] = item.msg ?? 'Nilai tidak valid'
    }
    message = 'Periksa kembali isian yang ditandai.'
  } else if (typeof obj.detail === 'string') {
    message = obj.detail
  } else {
    message =
      {
        400: 'Permintaan tidak valid.',
        401: 'Sesi berakhir. Masuk kembali untuk melanjutkan.',
        403: 'Anda tidak punya akses ke data ini.',
        404: 'Data tidak ditemukan.',
        409: 'NIK sudah terdaftar.',
        500: 'Terjadi kesalahan di server. Coba lagi.',
      }[status] ?? 'Terjadi kesalahan. Coba lagi.'
  }
  return new ApiError(status, message, Object.keys(fields).length ? fields : undefined)
}
