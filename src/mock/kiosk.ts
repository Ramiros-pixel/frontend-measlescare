import type { KioskActivity, KioskDevice } from './types'

/* Data perangkat kiosk simulasi. Ganti dengan endpoint /kiosk saat tersedia. */

export const KIOSK_DEVICES: KioskDevice[] = [
  {
    id_kiosk: 'KIOSK-001',
    nama: 'Kiosk Poli Anak',
    lokasi: 'Ruang Tunggu Poli Anak',
    status: 'Online',
    kamera: 'Aktif',
    sensor_suhu: 'Aktif',
    terakhir_aktif: '2026-11-12T14:30:00',
    total_skrining: 86,
    tanggal_registrasi: '2026-10-10T10:15:00',
    versi_aplikasi: 'v1.0.2',
    ping_ms: 28,
    storage_used_gb: 15.6,
    storage_total_gb: 20,
  },
  {
    id_kiosk: 'KIOSK-002',
    nama: 'Kiosk Pendaftaran',
    lokasi: 'Area Pendaftaran',
    status: 'Online',
    kamera: 'Aktif',
    sensor_suhu: 'Aktif',
    terakhir_aktif: '2026-11-12T14:28:00',
    total_skrining: 74,
    tanggal_registrasi: '2026-10-12T09:20:00',
    versi_aplikasi: 'v1.0.2',
    ping_ms: 34,
    storage_used_gb: 11.2,
    storage_total_gb: 20,
  },
  {
    id_kiosk: 'KIOSK-003',
    nama: 'Kiosk Ruang Isolasi',
    lokasi: 'Ruang Isolasi Sementara',
    status: 'Offline',
    kamera: 'Tidak Aktif',
    sensor_suhu: 'Tidak Aktif',
    terakhir_aktif: '2026-11-11T17:12:00',
    total_skrining: 0,
    tanggal_registrasi: '2026-10-15T11:05:00',
    versi_aplikasi: 'v1.0.1',
    ping_ms: null,
    storage_used_gb: 4.4,
    storage_total_gb: 20,
  },
]

export const KIOSK_ACTIVITY: KioskActivity[] = [
  { id: 'a1', waktu: '2026-11-12T14:30:00', jenis: 'Skrining selesai', keterangan: 'P-03174' },
  { id: 'a2', waktu: '2026-11-12T14:10:00', jenis: 'Skrining selesai', keterangan: 'P-03173' },
  { id: 'a3', waktu: '2026-11-12T13:57:00', jenis: 'Skrining selesai', keterangan: 'P-03172' },
  { id: 'a4', waktu: '2026-11-12T13:20:00', jenis: 'Perangkat diakses', keterangan: 'Petugas masuk ke menu pemeriksaan' },
  { id: 'a5', waktu: '2026-11-12T08:00:00', jenis: 'Perangkat diaktifkan', keterangan: 'Perangkat dinyalakan otomatis' },
]
