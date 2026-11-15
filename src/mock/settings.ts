import type { AuditEntry, FacilityProfile, ScreeningRule } from './types'

/* Profil fasilitas, aturan skrining, dan audit log simulasi. */

export const FACILITY_PROFILE: FacilityProfile = {
  nama: 'Puskesmas Cinambo',
  jenis: 'Puskesmas',
  alamat: 'Jl. Cinambo No. 45, Kec. Cinambo, Kota Bandung, Jawa Barat',
  kota: 'Kota Bandung',
  provinsi: 'Jawa Barat',
  kode: 'PKM-CINAMBO-001',
  telepon: '(022) 7812345',
  email: 'puskesmas.cinambo@bdg.go.id',
  penanggung_jawab: 'dr. Riska Maharani',
  jam_operasional: 'Senin - Jumat, 08.00 - 16.00',
  layanan_skrining: 'Aktif',
  versi_aplikasi: 'v1.0.2',
  versi_aturan_skrining: 'v1.1',
  aturan_diperbarui: '2026-11-05T00:00:00',
}

export const SCREENING_RULES: ScreeningRule[] = [
  {
    id: 'R-01',
    nama: 'Suhu tubuh',
    deskripsi: 'Suhu 38,0 C atau lebih tinggi ditandai sebagai perlu penanganan segera.',
    status: 'Aktif',
    diperbarui: '2026-11-05T00:00:00',
  },
  {
    id: 'R-02',
    nama: 'Gejala pernapasan',
    deskripsi: 'Batuk kering atau berdahak dicatat sebagai gejala pernapasan yang perlu dipantau.',
    status: 'Aktif',
    diperbarui: '2026-11-05T00:00:00',
  },
  {
    id: 'R-03',
    nama: 'Tanda bahaya',
    deskripsi: 'Tanda bahaya pada hasil pemeriksaan perlu tindakan tenaga kesehatan.',
    status: 'Aktif',
    diperbarui: '2026-11-02T00:00:00',
  },
  {
    id: 'R-04',
    nama: 'Deteksi ruam kulit',
    deskripsi: 'Foto ruam kulit dari perangkat kiosk dianalisis untuk membantu penentuan kategori.',
    status: 'Aktif',
    diperbarui: '2026-10-28T00:00:00',
  },
]

export const AUDIT_ENTRIES: AuditEntry[] = [
  { id: 'lg-001', waktu: '2026-11-12T13:58:00', pengguna: 'dr.riska', aksi: 'Masuk', target: 'Panel admin', ip: '10.0.2.14' },
  { id: 'lg-002', waktu: '2026-11-12T13:41:00', pengguna: 'admin', aksi: 'Melihat data skrining', target: 'Data Skrining', ip: '10.0.2.8' },
  { id: 'lg-003', waktu: '2026-11-12T11:07:00', pengguna: 'sinta', aksi: 'Mencari pasien', target: 'Manajemen Pasien', ip: '10.0.2.21' },
  { id: 'lg-004', waktu: '2026-11-12T09:32:00', pengguna: 'admin', aksi: 'Mencetak laporan', target: 'Laporan & Statistik', ip: '10.0.2.8' },
  { id: 'lg-005', waktu: '2026-11-11T16:20:00', pengguna: 'budi', aksi: 'Masuk', target: 'Panel admin', ip: '10.0.2.33' },
  { id: 'lg-006', waktu: '2026-11-11T14:05:00', pengguna: 'admin', aksi: 'Ubah profil fasilitas', target: 'Pengaturan', ip: '10.0.2.8' },
]
