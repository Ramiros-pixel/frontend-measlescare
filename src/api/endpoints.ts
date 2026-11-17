import { request, requestMultipart } from './client'
import type {
  CameraCreate,
  CameraRecord,
  GejalaCreate,
  GejalaRecord,
  HistoryItem,
  User,
  MasterGejala,
  EvaluasiPakarRequest,
  EvaluasiPakarResponse,
  HasilPakarResponse,
feature/measleswatch-frontend
  MeaslesPredictResponse,

  FaceRecognizeRequest,
  FaceRecognizeResponse,
  KioskPatient, KioskFaceResponse, KioskCaptureResponse,

} from './types'

export interface LoginInput {
  NIK: string
  password: string
}

export interface RegisterInput {
  NIK: string
  Name: string
  Tempat_Tgl_Lahir?: string | null
  Golongan_darah?: string | null
  Email?: string | null
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


export const pakarApi = {
  masterGejala: (signal?: AbortSignal) =>
    request<{ total: number; data: MasterGejala[] }>(
      '/pakar/master-gejala',
      { signal }
    ),

  evaluasi: (input: EvaluasiPakarRequest, kioskSessionToken?: string) =>
    request<EvaluasiPakarResponse>('/pakar/evaluasi', {
      method: 'POST',
      body: input,
      headers: kioskSessionToken
        ? { 'X-Kiosk-Session': kioskSessionToken }
        : undefined,
    }),

  hasil: (idGejala: string, signal?: AbortSignal) =>
    request<HasilPakarResponse>(
      `/pakar/hasil/${encodeURIComponent(idGejala)}`,
      { signal }
    ),
}

feature/measleswatch-frontend
export const measlesApi = {
  predict: (file: Blob | File, signal?: AbortSignal) => {
    const formData = new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    } else {
      formData.append('file', file, 'lesion.jpg')
    }
    return requestMultipart<MeaslesPredictResponse>('/v1/measles/predict', formData, signal)
  },

// Face recognition publik: backend menerima satu frame JPEG/PNG dalam base64.
export const faceApi = {
  recognize: (input: FaceRecognizeRequest, signal?: AbortSignal) =>
    request<FaceRecognizeResponse>('/face/recognize', {
      method: 'POST',
      body: input,
      signal,
    }),
}

const kioskHeaders = {
  'X-Kiosk-Key': (import.meta.env.VITE_KIOSK_API_KEY as string | undefined) ?? '',
}

export const kioskSessionApi = {
  create: (NIK: string, image: string) =>
    request<{
      access_token: string
      token_type: string
      expires_in: number
      patient: { NIK: string; Name: string }
    }>('/kiosk-session/create', {
      method: 'POST',
      body: { NIK, image },
      headers: kioskHeaders,
    }),
  createGejala: (input: GejalaCreate, sessionToken: string) =>
    request<GejalaRecord>('/kiosk-session/gejala', {
      method: 'POST',
      body: input,
      headers: { 'X-Kiosk-Session': sessionToken },
    }),
}

export const kioskApi = {
  identifyRFID: (rfid_uid: string) =>
    request<KioskPatient>('/kiosk/identify-rfid', {
      method: 'POST', body: { rfid_uid }, headers: kioskHeaders,
    }),
  saveEmail: (NIK: string, Email: string) =>
    request<{ success: boolean; Email: string }>('/kiosk/email', {
      method: 'POST', body: { NIK, Email }, headers: kioskHeaders,
    }),
  recognize: (NIK: string, image: string) =>
    request<KioskFaceResponse>('/kiosk/face/recognize', {
      method: 'POST', body: { NIK, image }, headers: kioskHeaders,
    }),
  capture: (NIK: string, image: string) =>
    request<KioskCaptureResponse>('/kiosk/face/capture', {
      method: 'POST', body: { NIK, image }, headers: kioskHeaders, timeoutMs: 30000,
    }),
  train: (NIK: string) =>
    request<{ nik: string; my_samples: number; total_samples: number; total_users: number; message: string }>(
      '/kiosk/face/train', { method: 'POST', body: { NIK }, headers: kioskHeaders, timeoutMs: 120000 }
    ),

}
