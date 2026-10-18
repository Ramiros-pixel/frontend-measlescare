export interface User {
  NIK: string
  Name: string
  Tgl_lahir: string
  Alamat: string | null
  id_Role: string
  role_name: string | null
}

export interface CameraRecord {
  id_cam: string
  Status: string | null
  id_gejala: string
  Tanggal: string
}

export interface CameraCreate {
  Status: string | null
  id_gejala: string
}

export interface GejalaRecord {
  id_gejala: string
  NIK: string
  Batuk: string | null
  Suhu: number | null
  Tanggal: string
}

export interface GejalaCreate {
  Suhu?: number | null
  Batuk?: string | null
}

export interface HistoryCamera {
  id_cam: string
  Status: string | null
  Tanggal: string
  reports: { id_rept: string }[]
}

export interface HistoryItem {
  id_gejala: string
  NIK: string
  nama_user: string | null
  Batuk: string | null
  Suhu: number | null
  Tanggal: string
  cameras: HistoryCamera[]
}

export type Role = 'R1' | 'R2'

export function isAdmin(user: User | null | undefined): boolean {
  return user?.id_Role === 'R1'
}
