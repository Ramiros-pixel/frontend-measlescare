import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  INITIAL_SCREENINGS,
  type HasilKategori,
  type ScreeningItem,
  type TindakLanjutStatus,
} from '@/mock/screening'
import { cn } from '@/lib/cn'

// Toast notification model
interface ToastInfo {
  id: number
  type: 'success' | 'info' | 'danger'
  message: string
}

// Visualisasi foto ruam kulit dengan tekstur maculopapular khas campak
function RashPhotoPlaceholder({ className, onExpand }: { className?: string; onExpand?: () => void }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-rose-200 shadow-inner group', className)}>
      <svg viewBox="0 0 200 160" className="size-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="skin" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#f8c8b4" />
            <stop offset="60%" stopColor="#f3b59f" />
            <stop offset="100%" stopColor="#e89e87" />
          </radialGradient>
          <filter id="blurFilter">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
        {/* Base skin */}
        <rect width="200" height="160" fill="url(#skin)" />
        {/* Natural skin subtle tones */}
        <ellipse cx="60" cy="50" rx="45" ry="35" fill="#f09b82" opacity="0.4" filter="url(#blurFilter)" />
        <ellipse cx="140" cy="110" rx="55" ry="40" fill="#ea9278" opacity="0.35" filter="url(#blurFilter)" />
        {/* Erythematous macules and papules (rash spots) */}
        <circle cx="85" cy="65" r="7" fill="#dc2626" opacity="0.85" filter="url(#blurFilter)" />
        <circle cx="85" cy="65" r="4.5" fill="#b91c1c" opacity="0.9" />
        <circle cx="98" cy="80" r="8" fill="#dc2626" opacity="0.8" filter="url(#blurFilter)" />
        <circle cx="98" cy="80" r="5" fill="#b91c1c" opacity="0.85" />
        <circle cx="70" cy="90" r="6" fill="#dc2626" opacity="0.8" filter="url(#blurFilter)" />
        <circle cx="70" cy="90" r="4" fill="#991b1b" opacity="0.85" />
        <circle cx="115" cy="55" r="6.5" fill="#ef4444" opacity="0.8" filter="url(#blurFilter)" />
        <circle cx="115" cy="55" r="4" fill="#b91c1c" opacity="0.85" />
        <circle cx="130" cy="75" r="7.5" fill="#dc2626" opacity="0.8" filter="url(#blurFilter)" />
        <circle cx="130" cy="75" r="4.5" fill="#991b1b" opacity="0.85" />
        <circle cx="55" cy="60" r="5.5" fill="#ef4444" opacity="0.75" filter="url(#blurFilter)" />
        <circle cx="55" cy="60" r="3" fill="#b91c1c" opacity="0.8" />
        <circle cx="80" cy="115" r="7" fill="#dc2626" opacity="0.8" filter="url(#blurFilter)" />
        <circle cx="80" cy="115" r="4" fill="#b91c1c" opacity="0.85" />
        <circle cx="110" cy="105" r="8" fill="#dc2626" opacity="0.8" filter="url(#blurFilter)" />
        <circle cx="110" cy="105" r="5" fill="#991b1b" opacity="0.9" />
        <circle cx="145" cy="100" r="6" fill="#ef4444" opacity="0.75" filter="url(#blurFilter)" />
        <circle cx="145" cy="100" r="3.5" fill="#b91c1c" opacity="0.8" />
        <circle cx="65" cy="40" r="4" fill="#dc2626" opacity="0.7" />
        <circle cx="150" cy="50" r="5" fill="#dc2626" opacity="0.75" />
        <circle cx="45" cy="85" r="4.5" fill="#ef4444" opacity="0.7" />
        <circle cx="125" cy="130" r="5.5" fill="#dc2626" opacity="0.75" />
        <circle cx="95" cy="40" r="4" fill="#ef4444" opacity="0.7" />
        <circle cx="40" cy="120" r="4" fill="#dc2626" opacity="0.65" />
        <circle cx="160" cy="80" r="4" fill="#ef4444" opacity="0.7" />
      </svg>

      {/* Button to expand/fullscreen photo */}
      {onExpand && (
        <button
          type="button"
          onClick={onExpand}
          title="Perbesar foto ruam"
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg bg-black/50 text-white backdrop-blur-xs transition hover:bg-black/70 hover:scale-105"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function AdminScreeningPage() {
  // State data skrining (diinisialisasi dari INITIAL_SCREENINGS)
  const [screenings, setScreenings] = useState<ScreeningItem[]>(() => {
    const saved = sessionStorage.getItem('mc_admin_screenings_state')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return INITIAL_SCREENINGS
      }
    }
    return INITIAL_SCREENINGS
  })

  // Simpan ke sessionStorage saat state berubah
  const updateScreeningsState = (newScreenings: ScreeningItem[]) => {
    setScreenings(newScreenings)
    try {
      sessionStorage.setItem('mc_admin_screenings_state', JSON.stringify(newScreenings))
    } catch {
      // ignore
    }
  }

  // State toast notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([])
  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }

  // Search & Filter states
  const [search, setSearch] = useState('')
  const [hasilFilter, setHasilFilter] = useState<'Semua' | HasilKategori>('Semua')
  const [tanggalFilter, setTanggalFilter] = useState<
    'Semua' | 'Hari Ini' | '7 Hari Terakhir' | '30 Hari Terakhir'
  >('Semua')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // Pagination state (10 data per halaman sesuai screenshot referensi)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Selected screening for Right Detail Panel (default ke item #1: Aisyah Putri)
  const [selectedItem, setSelectedItem] = useState<ScreeningItem | null>(() => {
    return INITIAL_SCREENINGS[0] || null
  })

  // Active Tab in Detail Panel: 0 = Hasil Pemeriksaan, 1 = Jawaban Gejala, 2 = Tindak Lanjut
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0)

  // Modal states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<TindakLanjutStatus>('Ditindaklanjuti')
  const [updatePetugas, setUpdatePetugas] = useState('')
  const [updateCatatan, setUpdateCatatan] = useState('')

  // Filtered & Sorted calculation
  const filteredScreenings = useMemo(() => {
    return screenings.filter((item) => {
      // Filter Hasil Skrining
      if (hasilFilter !== 'Semua' && item.hasilSkrining !== hasilFilter) return false

      // Filter Tanggal
      if (tanggalFilter !== 'Semua') {
        const itemDate = new Date(item.tanggalIso)
        const now = new Date('2026-11-12T23:59:59') // Anchor date per prototype (12 Nov 2026)

        if (tanggalFilter === 'Hari Ini') {
          const isToday =
            itemDate.getFullYear() === now.getFullYear() &&
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getDate() === now.getDate()
          if (!isToday) return false
        } else if (tanggalFilter === '7 Hari Terakhir') {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
          if (diffDays > 7 || diffDays < 0) return false
        } else if (tanggalFilter === '30 Hari Terakhir') {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
          if (diffDays > 30 || diffDays < 0) return false
        }
      }

      // Search (ID pasien atau nama)
      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchId = item.idPasien.toLowerCase().includes(query)
        const matchNama = item.namaPasien.toLowerCase().includes(query)
        const matchNik = item.nik.includes(query)
        if (!matchId && !matchNama && !matchNik) return false
      }

      return true
    }).sort((a, b) => {
      const timeA = new Date(a.tanggalIso).getTime()
      const timeB = new Date(b.tanggalIso).getTime()
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })
  }, [screenings, search, hasilFilter, tanggalFilter, sortOrder])

  // Pagination calculation
  // Total angka representatif statistik sesuai dashboard/mockup (1.842)
  const baseStatTotal = 1842
  const totalItems = filteredScreenings.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedScreenings = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredScreenings.slice(start, start + pageSize)
  }, [filteredScreenings, page, pageSize])

  // Reset Filters
  const handleReset = () => {
    setSearch('')
    setHasilFilter('Semua')
    setTanggalFilter('Semua')
    setSortOrder('desc')
    setPage(1)
    showToast('Filter pencarian telah direset', 'info')
  }

  // Open modal update tindak lanjut
  const handleOpenUpdateModal = () => {
    if (!selectedItem) return
    setUpdateStatus(selectedItem.tindakLanjut)
    setUpdatePetugas(selectedItem.tindakLanjutDetail.petugas)
    setUpdateCatatan(selectedItem.tindakLanjutDetail.catatan)
    setIsUpdateModalOpen(true)
  }

  // Save update tindak lanjut
  const handleSaveTindakLanjut = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    const nowStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())

    const updatedItem: ScreeningItem = {
      ...selectedItem,
      tindakLanjut: updateStatus,
      tindakLanjutDetail: {
        petugas: updatePetugas.trim() || 'Petugas Kesehatan',
        waktu: nowStr,
        catatan: updateCatatan.trim() || 'Telah dievaluasi oleh petugas kesehatan.',
      },
    }

    const updatedList = screenings.map((s) => (s.id === selectedItem.id ? updatedItem : s))
    updateScreeningsState(updatedList)
    setSelectedItem(updatedItem)
    setIsUpdateModalOpen(false)
    showToast(`Status tindak lanjut ${selectedItem.namaPasien} berhasil diperbarui!`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Alert Popups */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all animate-in slide-in-from-bottom-2',
              toast.type === 'success' && 'bg-emerald-600 text-white',
              toast.type === 'info' && 'bg-blue-600 text-white',
              toast.type === 'danger' && 'bg-rose-600 text-white',
            )}
          >
            <span>
              {toast.type === 'success' && '✓'}
              {toast.type === 'info' && 'ℹ'}
              {toast.type === 'danger' && '✕'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header Halaman & Breadcrumb */}
      <div>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Link to="/admin" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-text">Data Skrining</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Data Skrining
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola dan pantau seluruh hasil skrining campak dari perangkat kiosk.
        </p>
      </div>

      {/* Ringkasan Statistik (4 Kartu persis sesuai gambar referensi) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Kartu 1: Total Skrining */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-action/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Total Skrining
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                ↑ +86
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">1.842</p>
            <p className="mt-1 text-xs text-muted">seluruh periode</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect width="8" height="4" x="8" y="2" rx="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Kartu 2: Belum Memenuhi Kriteria */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-emerald-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Belum Memenuhi Kriteria
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                75,3%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">1.387</p>
            <p className="mt-1 text-xs text-muted">skrining non-suspek</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-6">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Kartu 3: Mengarah ke Suspek */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-amber-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Mengarah ke Suspek
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                19,9%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">367</p>
            <p className="mt-1 text-xs text-muted">perlu evaluasi medis</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
        </div>

        {/* Kartu 4: Perlu Penanganan Segera */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-rose-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Perlu Penanganan Segera
              </span>
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
                4,8%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">88</p>
            <p className="mt-1 text-xs text-muted">indikasi tanda bahaya</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M19 14V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8" />
              <path d="M3 14h18a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z" />
              <path d="M12 9v6" />
              <path d="M9 12h6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Daftar Hasil Skrining (Kiri) + Detail Skrining (Kanan) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Tabel Skrining (8 kolom jika detail buka, 12 jika tutup) */}
        <div className={cn(selectedItem ? 'lg:col-span-8' : 'lg:col-span-12', 'transition-all duration-200')}>
          <div className="rounded-2xl border border-border-soft bg-surface shadow-card overflow-hidden">
            {/* Header Card Tabel */}
            <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect width="8" height="4" x="8" y="2" rx="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">Daftar Hasil Skrining</h2>
                  <p className="text-xs text-muted">
                    Menampilkan data riwayat skrining kiosk fasyankes
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Toolbar & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border-soft bg-surface-muted/50 p-4">
              {/* Search Bar */}
              <div className="relative min-w-[190px] flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Cari ID pasien atau nama..."
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface pl-9 pr-3 text-xs text-text placeholder:text-muted transition focus-visible:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Hasil Skrining */}
              <div className="w-auto">
                <select
                  value={hasilFilter}
                  onChange={(e) => {
                    setHasilFilter(e.target.value as 'Semua' | HasilKategori)
                    setPage(1)
                  }}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-3 pr-8 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Semua">Semua Hasil Skrining</option>
                  <option value="Belum Memenuhi Kriteria">Belum Memenuhi Kriteria</option>
                  <option value="Mengarah ke Suspek">Mengarah ke Suspek</option>
                  <option value="Perlu Penanganan Segera">Perlu Penanganan Segera</option>
                </select>
              </div>

              {/* Filter Tanggal */}
              <div className="w-auto">
                <select
                  value={tanggalFilter}
                  onChange={(e) => {
                    setTanggalFilter(
                      e.target.value as 'Semua' | 'Hari Ini' | '7 Hari Terakhir' | '30 Hari Terakhir',
                    )
                    setPage(1)
                  }}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-3 pr-8 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Semua">Semua Tanggal</option>
                  <option value="Hari Ini">Hari Ini</option>
                  <option value="7 Hari Terakhir">7 Hari Terakhir</option>
                  <option value="30 Hari Terakhir">30 Hari Terakhir</option>
                </select>
              </div>

              {/* Tombol Reset */}
              {(search || hasilFilter !== 'Semua' || tanggalFilter !== 'Semua') && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border-soft bg-surface px-3 text-xs font-semibold text-muted transition hover:border-action hover:text-action"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-muted/70 text-xs font-bold uppercase tracking-wider text-muted">
                    <th className="w-12 px-4 py-3.5 text-center">No</th>
                    <th
                      className="cursor-pointer px-4 py-3.5 select-none hover:text-action"
                      onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                    >
                      <div className="flex items-center gap-1">
                        <span>Waktu Skrining</span>
                        <span className="text-[10px] text-slate-400">
                          {sortOrder === 'desc' ? '▼' : '▲'}
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3.5">ID Pasien</th>
                    <th className="px-4 py-3.5">Nama Pasien</th>
                    <th className="px-4 py-3.5">Suhu</th>
                    <th className="px-4 py-3.5">Hasil Skrining</th>
                    <th className="px-4 py-3.5">Tindak Lanjut</th>
                    <th className="w-20 px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {paginatedScreenings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-muted">
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                          <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                            🔍
                          </span>
                          <p className="text-sm font-semibold text-text">Tidak ada data skrining</p>
                          <p className="text-xs text-muted">
                            Tidak ditemukan hasil skrining yang cocok dengan filter yang dipilih.
                          </p>
                          <button
                            type="button"
                            onClick={handleReset}
                            className="mt-2 text-xs font-semibold text-action underline-offset-2 hover:underline"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedScreenings.map((item, idx) => {
                      const rowNumber = (page - 1) * pageSize + idx + 1
                      const isSelected = selectedItem?.id === item.id

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            'group cursor-pointer transition-colors duration-150',
                            isSelected
                              ? 'bg-blue-50/70 hover:bg-blue-50'
                              : 'hover:bg-slate-50/80',
                          )}
                        >
                          {/* No */}
                          <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500 tabular">
                            {rowNumber}
                          </td>

                          {/* Waktu Skrining */}
                          <td className="px-4 py-3.5 tabular text-xs text-slate-600 whitespace-nowrap">
                            {item.waktu}
                          </td>

                          {/* ID Pasien */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold tabular text-xs text-slate-800">
                              {item.idPasien}
                            </span>
                          </td>

                          {/* Nama Pasien */}
                          <td className="px-4 py-3.5">
                            <p className="text-xs font-semibold text-text group-hover:text-action">
                              {item.namaPasien}
                            </p>
                          </td>

                          {/* Suhu */}
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                'tabular text-xs font-semibold',
                                item.suhu >= 38.0
                                  ? 'text-rose-600'
                                  : item.suhu >= 37.5
                                    ? 'text-amber-600'
                                    : 'text-slate-700',
                              )}
                            >
                              {item.suhu.toFixed(1).replace('.', ',')} °C
                            </span>
                          </td>

                          {/* Hasil Skrining Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {item.hasilSkrining === 'Perlu Penanganan Segera' ? (
                              <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                Perlu Penanganan Segera
                              </span>
                            ) : item.hasilSkrining === 'Mengarah ke Suspek' ? (
                              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                                Mengarah ke Suspek
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                Belum Memenuhi Kriteria
                              </span>
                            )}
                          </td>

                          {/* Tindak Lanjut Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {item.tindakLanjut === 'Menunggu' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-slate-400">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span>Menunggu</span>
                              </span>
                            ) : item.tindakLanjut === 'Ditindaklanjuti' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3 text-emerald-600">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span>Ditindaklanjuti</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-action">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="9 12 11 14 15 10" />
                                </svg>
                                <span>Selesai</span>
                              </span>
                            )}
                          </td>

                          {/* Tombol Aksi (Mata) */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                title="Lihat detail skrining"
                                onClick={() => setSelectedItem(item)}
                                className={cn(
                                  'grid size-8 place-items-center rounded-lg border transition-colors',
                                  isSelected
                                    ? 'border-action bg-action text-white'
                                    : 'border-border-soft bg-surface text-action hover:border-action hover:bg-action-soft',
                                )}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-5 py-3.5">
              <p className="tabular text-xs text-muted">
                Menampilkan{' '}
                <span className="font-semibold text-text">
                  {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>{' '}
                –{' '}
                <span className="font-semibold text-text">
                  {Math.min(page * pageSize, totalItems)}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-text">
                  {search || hasilFilter !== 'Semua' || tanggalFilter !== 'Semua'
                    ? `${totalItems} hasil`
                    : `${baseStatTotal.toLocaleString('id-ID')} data`}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-xs font-semibold text-muted transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={cn(
                      'grid size-8 place-items-center rounded-lg border text-xs font-semibold transition',
                      page === num
                        ? 'border-action bg-action text-white shadow-2xs'
                        : 'border-border-soft bg-surface text-muted hover:border-action hover:text-action',
                    )}
                  >
                    {num}
                  </button>
                ))}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-xs text-muted">...</span>
                    <button
                      type="button"
                      onClick={() => setPage(185)}
                      className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-xs font-semibold text-muted hover:border-action hover:text-action"
                    >
                      185
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-xs font-semibold text-muted transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel Detail Skrining (Persis seperti mockup screenshot) */}
        {selectedItem ? (
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-4 sticky top-20">
              {/* Card Detail Skrining */}
              <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card">
                {/* Header Detail */}
                <div className="flex items-center justify-between border-b border-border-soft pb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-lg bg-blue-50 text-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect width="8" height="4" x="8" y="2" rx="1" />
                        <path d="m9 14 2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-text">Detail Skrining</h3>
                  </div>

                  <button
                    type="button"
                    title="Tutup panel detail"
                    onClick={() => setSelectedItem(null)}
                    className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Pasien Profile Box */}
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface-muted/40 p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-blue-100 text-action">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <p className="tabular text-xs font-semibold text-muted">{selectedItem.idPasien}</p>
                      <h4 className="text-sm font-bold text-text">{selectedItem.namaPasien}</h4>
                    </div>
                  </div>

                  <div>
                    {selectedItem.hasilSkrining === 'Perlu Penanganan Segera' ? (
                      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        Perlu Penanganan Segera
                      </span>
                    ) : selectedItem.hasilSkrining === 'Mengarah ke Suspek' ? (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Mengarah ke Suspek
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Belum Memenuhi Kriteria
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Waktu & Suhu */}
                <div className="mt-4 space-y-2 border-b border-border-soft pb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center text-muted">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                    </span>
                    <span className="w-24 text-muted">Waktu Skrining</span>
                    <span className="text-muted">:</span>
                    <span className="tabular font-medium text-text">{selectedItem.waktu}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center text-muted">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                      </svg>
                    </span>
                    <span className="w-24 text-muted">Suhu Tubuh</span>
                    <span className="text-muted">:</span>
                    <span className="tabular font-bold text-text">
                      {selectedItem.suhu.toFixed(1).replace('.', ',')} °C
                    </span>
                  </div>
                </div>

                {/* Tab Navigation (3 Tab: Hasil Pemeriksaan, Jawaban Gejala, Tindak Lanjut) */}
                <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab(0)}
                    className={cn(
                      'flex-1 rounded-lg py-2 font-semibold transition',
                      activeTab === 0
                        ? 'bg-action text-white shadow-xs'
                        : 'text-slate-600 hover:text-text',
                    )}
                  >
                    Hasil Pemeriksaan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(1)}
                    className={cn(
                      'flex-1 rounded-lg py-2 font-semibold transition',
                      activeTab === 1
                        ? 'bg-action text-white shadow-xs'
                        : 'text-slate-600 hover:text-text',
                    )}
                  >
                    Jawaban Gejala
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(2)}
                    className={cn(
                      'flex-1 rounded-lg py-2 font-semibold transition',
                      activeTab === 2
                        ? 'bg-action text-white shadow-xs'
                        : 'text-slate-600 hover:text-text',
                    )}
                  >
                    Tindak Lanjut
                  </button>
                </div>

                {/* Tab 0 Content: Hasil Pemeriksaan */}
                {activeTab === 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left: Foto Ruam */}
                    <div>
                      <p className="text-xs font-bold text-text mb-2">Foto Ruam</p>
                      <RashPhotoPlaceholder
                        className="h-32 w-full cursor-pointer"
                        onExpand={() => setIsPhotoZoomOpen(true)}
                      />
                      <p className="mt-1 text-[11px] text-muted text-center">
                        Kamera kiosk ESP32-CAM
                      </p>
                    </div>

                    {/* Right: Ringkasan Hasil */}
                    <div className="flex flex-col justify-between">
                      <p className="text-xs font-bold text-text mb-2">Ringkasan Hasil</p>
                      <div className="space-y-2.5 text-xs">
                        {/* Tanda Bahaya */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1 text-muted">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-rose-500">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                              <line x1="12" x2="12" y1="9" y2="13" />
                            </svg>
                            Tanda Bahaya
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[11px] font-bold',
                              selectedItem.tandaBahaya
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700',
                            )}
                          >
                            {selectedItem.tandaBahaya ? 'Ditemukan' : 'Tidak Ada'}
                          </span>
                        </div>

                        {/* Skor Gejala */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1 text-muted">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-blue-500">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            Skor Gejala
                          </span>
                          <span className="tabular font-bold text-text">{selectedItem.skorGejala}</span>
                        </div>

                        {/* Hasil Deteksi AI */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1 text-muted">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-action">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M3 12h2m14 0h2m-9-9v2m0 14v2" />
                            </svg>
                            Hasil Deteksi AI
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[11px] font-bold',
                              selectedItem.hasilDeteksiAI === 'Mengarah Campak'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700',
                            )}
                          >
                            {selectedItem.hasilDeteksiAI}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 1 Content: Jawaban Gejala */}
                {activeTab === 1 && (
                  <div className="mt-4 space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
                    <div className="rounded-lg bg-surface-muted p-2.5 mb-3 border border-border-soft flex items-center justify-between">
                      <span className="font-semibold text-muted">Pengukuran Suhu Tubuh:</span>
                      <span className="font-bold tabular text-text">{selectedItem.suhu.toFixed(1).replace('.', ',')} °C</span>
                    </div>

                    {[
                      { label: '1. Demam tinggi', val: selectedItem.gejala.demam },
                      { label: '2. Batuk', val: selectedItem.gejala.batuk },
                      { label: '3. Pilek (Coryza)', val: selectedItem.gejala.pilek },
                      { label: '4. Mata merah & berair (Konjungtivitis)', val: selectedItem.gejala.mataMerah },
                      { label: '5. Ruam makulopapular pada kulit', val: selectedItem.gejala.ruamKulit },
                      { label: '6. Ruam menyebar ke seluruh tubuh', val: selectedItem.gejala.ruamMenyeluruh },
                      { label: '7. Bercak putih di mulut (Koplik spot)', val: selectedItem.gejala.bercakKoplik },
                      { label: '8. Diare', val: selectedItem.gejala.diare },
                      { label: '9. Sesak napas / pernapasan cuping hidung', val: selectedItem.gejala.sesakNapas, danger: true },
                      { label: '10. Kejang', val: selectedItem.gejala.kejang, danger: true },
                      { label: '11. Penurunan kesadaran / lesu berat', val: selectedItem.gejala.penurunanKesadaran, danger: true },
                    ].map((g, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between rounded-lg p-2 border transition',
                          g.val
                            ? g.danger
                              ? 'border-rose-200 bg-rose-50/60'
                              : 'border-amber-200 bg-amber-50/50'
                            : 'border-border-soft/60 bg-surface',
                        )}
                      >
                        <span className={cn('text-xs', g.val ? 'font-semibold text-text' : 'text-muted')}>
                          {g.label}
                        </span>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[11px] font-bold',
                            g.val
                              ? g.danger
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {g.val ? 'Ya' : 'Tidak'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2 Content: Tindak Lanjut */}
                {activeTab === 2 && (
                  <div className="mt-4 space-y-3.5 text-xs">
                    <div className="rounded-xl border border-border-soft bg-surface-muted/60 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Status Saat Ini:</span>
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-bold',
                            selectedItem.tindakLanjut === 'Menunggu'
                              ? 'bg-slate-100 text-slate-700'
                              : selectedItem.tindakLanjut === 'Ditindaklanjuti'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-action',
                          )}
                        >
                          {selectedItem.tindakLanjut}
                        </span>
                      </div>
                      <div className="mt-2.5 space-y-1.5 border-t border-border-soft pt-2">
                        <p className="text-muted">
                          Petugas: <span className="font-semibold text-text">{selectedItem.tindakLanjutDetail.petugas}</span>
                        </p>
                        <p className="text-muted">
                          Waktu: <span className="tabular text-text">{selectedItem.tindakLanjutDetail.waktu}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-text mb-1">Catatan Petugas:</p>
                      <div className="rounded-xl border border-border-soft bg-surface p-3 text-xs leading-relaxed text-slate-700">
                        {selectedItem.tindakLanjutDetail.catatan || 'Belum ada catatan dari petugas kesehatan.'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenUpdateModal}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-action px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-action-hover active:scale-[0.99]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span>Perbarui Tindak Lanjut</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Rekomendasi (Di bawah panel detail) */}
              <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="grid size-6 place-items-center rounded-lg bg-blue-50 text-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text">
                    Rekomendasi
                  </h4>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {selectedItem.hasilSkrining === 'Perlu Penanganan Segera'
                    ? 'Pasien menunjukkan pola gejala yang mengarah ke suspek campak dan terdapat tanda bahaya. Segera lakukan pemeriksaan dokter untuk penanganan lebih lanjut.'
                    : selectedItem.hasilSkrining === 'Mengarah ke Suspek'
                      ? 'Pasien menunjukkan pola gejala yang perlu dievaluasi lebih lanjut. Disarankan pemeriksaan oleh tenaga kesehatan.'
                      : 'Hasil skrining belum menunjukkan pola gejala yang memenuhi kriteria suspek. Tetap perhatikan kondisi pasien dan ikuti arahan tenaga kesehatan.'}
                </p>

                <p className="mt-3 text-[11px] text-muted italic">
                  Catatan: Hasil skrining awal dari kiosk merupakan informasi pendukung dan bukan diagnosis medis final.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-dashed border-border-soft bg-surface p-8 text-center shadow-card">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-bold text-text">Pilih Data Skrining</h3>
              <p className="mt-1 text-xs text-muted">
                Klik salah satu baris pada tabel atau tombol mata 👁️ untuk melihat detail lengkap hasil pemeriksaan dan tindak lanjut.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: Perbarui Tindak Lanjut Pasien
      ======================================================== */}
      {isUpdateModalOpen && selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsUpdateModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h3 className="text-base font-bold text-text">Perbarui Tindak Lanjut</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Pasien: <span className="font-semibold text-text">{selectedItem.namaPasien}</span> ({selectedItem.idPasien})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTindakLanjut} className="mt-4 space-y-4">
              {/* Status Tindak Lanjut */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  Status Tindak Lanjut
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as TindakLanjutStatus)}
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs font-semibold text-text transition focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* Nama Petugas */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  Nama Petugas Pemeriksa
                </label>
                <input
                  type="text"
                  value={updatePetugas}
                  onChange={(e) => setUpdatePetugas(e.target.value)}
                  placeholder="Contoh: Dr. Riska Maharani"
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text transition focus-visible:border-action focus-visible:outline-none"
                />
              </div>

              {/* Catatan Petugas */}
              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  Catatan Evaluasi Petugas
                </label>
                <textarea
                  rows={4}
                  value={updateCatatan}
                  onChange={(e) => setUpdateCatatan(e.target.value)}
                  placeholder="Tuliskan catatan tindak lanjut, resep obat, atau arahan rujukan bagi pasien..."
                  className="w-full rounded-xl border border-border-soft bg-surface p-3 text-xs text-text transition focus-visible:border-action focus-visible:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="min-h-9 rounded-xl border border-border-soft bg-surface px-4 text-xs font-semibold text-muted hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-action px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-action-hover"
                >
                  Simpan Tindak Lanjut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: Pratinjau Foto Ruam Fullscreen
      ======================================================== */}
      {isPhotoZoomOpen && selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
        >
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsPhotoZoomOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h3 className="text-base font-bold text-text">Pratinjau Foto Ruam Kulit</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Tangkapan sensor optik kamera kiosk · {selectedItem.namaPasien} ({selectedItem.idPasien})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoZoomOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <RashPhotoPlaceholder className="h-64 w-full" />
            </div>

            <div className="mt-4 rounded-xl border border-border-soft bg-surface-muted/50 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Hasil Deteksi Computer Vision:</span>
                <span className="font-bold text-action">{selectedItem.hasilDeteksiAI} ({selectedItem.confidenceAI})</span>
              </div>
              <p className="mt-2 text-[11px] text-muted leading-relaxed">
                Visualisasi ruam menunjukkan lesi makulopapular eritematosa khas yang menyebar dari bagian leher/muka. Hasil deteksi kamera ini membantu skrining awal dan harus divalidasi oleh dokter.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPhotoZoomOpen(false)}
                className="min-h-9 rounded-xl bg-slate-800 px-5 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

