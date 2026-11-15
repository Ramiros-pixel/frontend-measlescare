/*
 * Tipe data simulasi untuk area admin.
 *
 * Semua data di folder src/mock/ TIDAK berasal dari backend. Backend FastAPI
 * saat ini hanya menyediakan /auth, /users, /gejala, /gejala/history, dan
 * /camera (lihat Documentation.md). Data di sini hanya dipakai untuk
 * tampilan yang belum punya endpoint, dan selalu diberi label "Simulasi".
 */

export interface KioskDevice {
  id_kiosk: string
  nama: string
  lokasi: string
  status: 'Online' | 'Offline'
  kamera: 'Aktif' | 'Tidak Aktif'
  sensor_suhu: 'Aktif' | 'Tidak Aktif'
  terakhir_aktif: string
  total_skrining: number
  tanggal_registrasi: string
  versi_aplikasi: string
  ping_ms: number | null
  storage_used_gb: number
  storage_total_gb: number
}

export interface KioskActivity {
  id: string
  waktu: string
  jenis: 'Skrining selesai' | 'Perangkat diakses' | 'Perangkat diaktifkan'
  keterangan: string
}

export interface FacilityProfile {
  nama: string
  jenis: string
  alamat: string
  kota: string
  provinsi: string
  kode: string
  telepon: string
  email: string
  penanggung_jawab: string
  jam_operasional: string
  layanan_skrining: 'Aktif' | 'Nonaktif'
  versi_aplikasi: string
  versi_aturan_skrining: string
  aturan_diperbarui: string
}

export interface ScreeningRule {
  id: string
  nama: string
  deskripsi: string
  status: 'Aktif' | 'Nonaktif'
  diperbarui: string
}

export interface AuditEntry {
  id: string
  waktu: string
  pengguna: string
  aksi: string
  target: string
  ip: string
}

export interface RfidRecord {
  nik: string
  uid_rfid: string
  status_terdaftar: boolean
}

export interface FollowUpState {
  id_gejala: string
  status: 'Menunggu' | 'Diperiksa' | 'Diindikasikan' | 'Selesai'
}
