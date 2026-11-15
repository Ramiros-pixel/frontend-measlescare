import { StatusBadge } from '@/components/ui/StatusBadge'
import { kategoriDari } from '@/lib/adminStats'
import type { HistoryItem } from '@/api/types'

/*
 * Badge hasil skrining. Kategori disusun dari data yang tersimpan di
 * backend (suhu dan gejala) memakai ambang pada lib/adminStats.
 */

type Kategori = 'Belum Memenuhi Kriteria' | 'Mengarah ke Suspek' | 'Perlu Penanganan Segera'

const TONE: Record<Kategori, 'success' | 'warning' | 'danger'> = {
  'Belum Memenuhi Kriteria': 'success',
  'Mengarah ke Suspek': 'warning',
  'Perlu Penanganan Segera': 'danger',
}

function Ikon({ kategori }: { kategori: Kategori }) {
  if (kategori === 'Belum Memenuhi Kriteria') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="size-full">
        <path d="m5 13 4 4L19 7" />
      </svg>
    )
  }
  if (kategori === 'Mengarah ke Suspek') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="size-full">
        <path d="M12 9v4m0 3.5v.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="size-full">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5m0 3.5v.01" />
    </svg>
  )
}

export function KategoriBadge({ kategori }: { kategori: Kategori }) {
  return <StatusBadge tone={TONE[kategori]} icon={<Ikon kategori={kategori} />} label={kategori} />
}

export function BadgeDariCatatan({ item }: { item: HistoryItem }) {
  return <KategoriBadge kategori={kategoriDari(item)} />
}
