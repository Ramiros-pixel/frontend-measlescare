/*
 * Perhitungan statistik area admin.
 *
 * Semua angka dihitung dari data nyata yang diambil dari /gejala/history.
 * Endpoint itu mengembalikan riwayat gabungan (gejala + deteksi kamera) dan
 * membatasi hasil dengan ?limit= (maks 200). Karena itu setiap statistik
 * selalu menyebut jumlah catatan yang jadi dasarnya; tidak ada angka yang
 * dibuat untuk mengisi tampilan.
 */

import type { HistoryItem } from '@/api/types'

export type KategoriHasil = 'Belum Memenuhi Kriteria' | 'Mengarah ke Suspek' | 'Perlu Penanganan Segera'

export interface RingkasanStatistik {
  total: number
  perKategori: Record<KategoriHasil, number>
  persenKategori: Record<KategoriHasil, number>
  tren: { label: string; value: number }[]
  gejala: { label: string; percent: number; icon: 'termometer' | 'pasien' | 'kamera' }[]
  terbaru: HistoryItem[]
}

/*
 * Kategori hasil diturunkan dari suhu dan gejala yang tercatat, memakai
 * ambang yang sama dengan aturan skrining di Pengaturan (aturan simulasi).
 * Ini bukan hasil diagnosis backend: backend belum menyimpan field kategori.
 */
const AMBANG_URGENT = 38.0
const AMBANG_SUSPEK = 37.5

export function kategoriDari(item: HistoryItem): KategoriHasil {
  const suhu = item.Suhu
  if (suhu !== null && suhu >= AMBANG_URGENT) return 'Perlu Penanganan Segera'
  if (suhu !== null && suhu >= AMBANG_SUSPEK) return 'Mengarah ke Suspek'
  if (item.Batuk && item.Batuk.trim() !== '') return 'Mengarah ke Suspek'
  return 'Belum Memenuhi Kriteria'
}

function keyHari(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function labelTanggal(d: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(d)
}

/* Tren 7 hari terakhir, dihitung dari tanggal pencatatan yang tersedia. */
export function hitungTren(items: HistoryItem[], jumlahHari = 7): { label: string; value: number }[] {
  const hasil: { label: string; value: number }[] = []
  const sekarang = new Date()
  for (let i = jumlahHari - 1; i >= 0; i -= 1) {
    const d = new Date(sekarang)
    d.setDate(sekarang.getDate() - i)
    const key = keyHari(d)
    const nilai = items.filter((item) => {
      const t = new Date(item.Tanggal)
      return !Number.isNaN(t.getTime()) && keyHari(t) === key
    }).length
    hasil.push({ label: labelTanggal(d), value: nilai })
  }
  return hasil
}

/*
 * Gejala hanya dihitung dari field yang benar-benar ada di backend
 * (Suhu dan Batuk). Gejala lain seperti pilek atau ruam kulit tidak
 * tersimpan di backend, jadi tidak ditampilkan sebagai angka.
 */
export function hitungGejala(items: HistoryItem[]): RingkasanStatistik['gejala'] {
  const total = items.length
  if (total === 0) return []
  const demam = items.filter((i) => i.Suhu !== null && i.Suhu >= AMBANG_SUSPEK).length
  const asset = items.filter((i) => i.Batuk && i.Batuk.trim() !== '').length
  return [
    { label: 'Demam', percent: (demam / total) * 100, icon: 'termometer' },
    { label: 'Batuk', percent: (asset / total) * 100, icon: 'pasien' },
  ]
}

export function hitungStatistik(items: HistoryItem[], jumlahHariTren = 7): RingkasanStatistik {
  const perKategori: Record<KategoriHasil, number> = {
    'Belum Memenuhi Kriteria': 0,
    'Mengarah ke Suspek': 0,
    'Perlu Penanganan Segera': 0,
  }
  for (const item of items) perKategori[kategoriDari(item)] += 1

  const total = items.length
  const persenKategori = {
    'Belum Memenuhi Kriteria':
      total > 0 ? (perKategori['Belum Memenuhi Kriteria'] / total) * 100 : 0,
    'Mengarah ke Suspek': total > 0 ? (perKategori['Mengarah ke Suspek'] / total) * 100 : 0,
    'Perlu Penanganan Segera':
      total > 0 ? (perKategori['Perlu Penanganan Segera'] / total) * 100 : 0,
  }

  const terbaru = [...items]
    .sort((a, b) => new Date(b.Tanggal).getTime() - new Date(a.Tanggal).getTime())
    .slice(0, 5)

  return {
    total,
    perKategori,
    persenKategori,
    tren: hitungTren(items, jumlahHariTren),
    gejala: hitungGejala(items),
    terbaru,
  }
}

/* Warna grafik mengikuti gambar referensi: hijau, kuning, merah. */
export const WARNA_KATEGORI: Record<KategoriHasil, string> = {
  'Belum Memenuhi Kriteria': '#16a34a',
  'Mengarah ke Suspek': '#f59e0b',
  'Perlu Penanganan Segera': '#dc2626',
}

export const URUTAN_KATEGORI: KategoriHasil[] = [
  'Belum Memenuhi Kriteria',
  'Mengarah ke Suspek',
  'Perlu Penanganan Segera',
]
