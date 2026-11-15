import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RINGKASAN_DATA,
  HARIAN_DATA,
  MINGGUAN_DATA,
  BULANAN_DATA,
  type ReportDataSet,
  type TrendPoint,
} from '@/mock/reports'
import { cn } from '@/lib/cn'

// Toast model
interface ToastInfo {
  id: number
  type: 'success' | 'info' | 'danger'
  message: string
}

// Chart 1: Line Area Chart dengan value badges di tiap titik
function TrendLineChart({ data, height = 240 }: { data: TrendPoint[]; height?: number }) {
  const gradId = useId()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const w = 680
  const h = height
  const padLeft = 40
  const padRight = 36
  const padTop = 38
  const padBottom = 34

  const maxVal = Math.max(...data.map((d) => d.value), 10)
  // Atur Y axis max ke kelipatan terdekat (misal 100 untuk data < 100)
  const yMax = maxVal <= 100 ? 100 : Math.ceil(maxVal / 100) * 100

  const stepX = data.length > 1 ? (w - padLeft - padRight) / (data.length - 1) : 0
  const getX = (i: number) => padLeft + i * stepX
  const getY = (val: number) => padTop + (1 - val / yMax) * (h - padTop - padBottom)

  // Buat path garis dan area
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i).toFixed(1)},${getY(d.value).toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L${getX(data.length - 1).toFixed(1)},${h - padBottom} L${padLeft},${h - padBottom} Z`

  // 5 grid lines horizontal (0, 20, 40, 60, 80, 100)
  const yTicks = [0, yMax * 0.2, yMax * 0.4, yMax * 0.6, yMax * 0.8, yMax]

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full select-none" role="img" aria-label="Grafik Tren Skrining">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
            <stop offset="70%" stopColor="#2563eb" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines & Y-Axis Ticks */}
        {yTicks.map((tick) => {
          const y = getY(tick)
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                x2={w - padRight}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray={tick === 0 ? undefined : '2 2'}
              />
              <text
                x={padLeft - 10}
                y={y + 3.5}
                textAnchor="end"
                fontSize="11"
                fontWeight="500"
                fill="#64748b"
                className="font-sans"
              >
                {Math.round(tick)}
              </text>
            </g>
          )
        })}

        {/* Gradient Area Fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Main Blue Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points, labels, and value badges */}
        {data.map((d, i) => {
          const cx = getX(i)
          const cy = getY(d.value)
          const isLast = i === data.length - 1
          const isHovered = hoveredIdx === i

          return (
            <g
              key={d.label}
              className="cursor-pointer transition-transform"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Vertical guideline on hover */}
              {isHovered && (
                <line
                  x1={cx}
                  x2={cx}
                  y1={padTop}
                  y2={h - padBottom}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Point Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isLast ? 6 : isHovered ? 6 : 4.5}
                fill={isLast ? '#2563eb' : '#ffffff'}
                stroke="#2563eb"
                strokeWidth={isLast ? 3 : 2.5}
                className="transition-all"
              />

              {/* Value Badge di atas titik data (persis seperti di gambar referensi) */}
              <g transform={`translate(${cx}, ${cy - 12})`}>
                {isLast ? (
                  // Titik terakhir (86): Solid Blue Pill
                  <g>
                    <rect
                      x="-17"
                      y="-18"
                      width="34"
                      height="20"
                      rx="6"
                      fill="#2563eb"
                      filter="drop-shadow(0px 2px 4px rgba(37,99,235,0.3))"
                    />
                    <text
                      x="0"
                      y="-4.5"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#ffffff"
                      className="font-sans"
                    >
                      {d.value}
                    </text>
                  </g>
                ) : (
                  // Titik lainnya: Light Blue Bordered Pill
                  <g>
                    <rect
                      x="-14"
                      y="-16"
                      width="28"
                      height="17"
                      rx="4"
                      fill="#eff6ff"
                      stroke="#bfdbfe"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-3.5"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#1e40af"
                      className="font-sans"
                    >
                      {d.value}
                    </text>
                  </g>
                )}
              </g>

              {/* X-Axis Label */}
              <text
                x={cx}
                y={h - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill={isHovered ? '#0f172a' : '#64748b'}
                className="font-sans"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Chart 2: SVG Donut Chart dengan Center Text dan Legend Samping
function DonutDistributionChart({
  total,
  belumMemenuhi,
  suspek,
  segera,
}: {
  total: number
  belumMemenuhi: { jumlah: number; persentase: number }
  suspek: { jumlah: number; persentase: number }
  segera: { jumlah: number; persentase: number }
}) {
  const r = 58
  const stroke = 22
  const circum = 2 * Math.PI * r

  // Segmen: Belum Memenuhi (Hijau), Suspek (Kuning), Segera (Merah)
  const p1 = (belumMemenuhi.jumlah / total) * circum
  const p2 = (suspek.jumlah / total) * circum
  const p3 = (segera.jumlah / total) * circum

  const offset1 = 0
  const offset2 = -p1
  const offset3 = -(p1 + p2)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2 py-1">
      {/* Donut Circle */}
      <div className="relative shrink-0">
        <svg viewBox="0 0 160 160" width="168" height="168" className="rotate-[-90deg]">
          {/* Base background ring */}
          <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />

          {/* Segment 1: Belum Memenuhi Kriteria (Hijau) */}
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth={stroke}
            strokeDasharray={`${p1} ${circum - p1}`}
            strokeDashoffset={offset1}
            className="transition-all duration-500"
          />

          {/* Segment 2: Mengarah ke Suspek (Kuning/Oranye) */}
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={stroke}
            strokeDasharray={`${p2} ${circum - p2}`}
            strokeDashoffset={offset2}
            className="transition-all duration-500"
          />

          {/* Segment 3: Perlu Penanganan Segera (Merah) */}
          <circle
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke="#ef4444"
            strokeWidth={stroke}
            strokeDasharray={`${p3} ${circum - p3}`}
            strokeDashoffset={offset3}
            className="transition-all duration-500"
          />
        </svg>

        {/* Center Text: Total & Skrining */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-bold tracking-tight text-slate-900 tabular">
            {total.toLocaleString('id-ID')}
          </span>
          <span className="text-xs font-medium text-slate-500">Skrining</span>
        </div>
      </div>

      {/* Legend di sebelah kanan */}
      <div className="flex-1 w-full space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full bg-[#10b981]" />
            <span className="font-medium text-slate-700">Belum Memenuhi Kriteria</span>
          </div>
          <span className="font-bold tabular text-slate-900">
            {belumMemenuhi.jumlah.toLocaleString('id-ID')}{' '}
            <span className="text-slate-500 font-normal">
              ({belumMemenuhi.persentase.toFixed(1).replace('.', ',')}%)
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full bg-[#f59e0b]" />
            <span className="font-medium text-slate-700">Mengarah ke Suspek</span>
          </div>
          <span className="font-bold tabular text-slate-900">
            {suspek.jumlah.toLocaleString('id-ID')}{' '}
            <span className="text-slate-500 font-normal">
              ({suspek.persentase.toFixed(1).replace('.', ',')}%)
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full bg-[#ef4444]" />
            <span className="font-medium text-slate-700">Perlu Penanganan Segera</span>
          </div>
          <span className="font-bold tabular text-slate-900">
            {segera.jumlah.toLocaleString('id-ID')}{' '}
            <span className="text-slate-500 font-normal">
              ({segera.persentase.toFixed(1).replace('.', ',')}%)
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AdminReportsPage() {
  // 4 Tab: 'ringkasan' | 'harian' | 'mingguan' | 'bulanan'
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'harian' | 'mingguan' | 'bulanan'>('ringkasan')

  // Date Range Picker state
  const [dateRangeSelection, setDateRangeSelection] = useState<string>('Bulan ini (1 - 12 Nov 2026)')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [customStart, setCustomStart] = useState('2026-11-01')
  const [customEnd, setCustomEnd] = useState('2026-11-12')
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  // PDF Preview modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  // Toast notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([])
  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }

  // Pilih dataset sesuai tab aktif
  const currentData: ReportDataSet = useMemo(() => {
    switch (activeTab) {
      case 'harian':
        return HARIAN_DATA
      case 'mingguan':
        return MINGGUAN_DATA
      case 'bulanan':
        return BULANAN_DATA
      case 'ringkasan':
      default:
        return RINGKASAN_DATA
    }
  }, [activeTab])

  // Handler Date Range Selection
  const handleSelectDateRange = (label: string) => {
    setDateRangeSelection(label)
    setIsDatePickerOpen(false)
    if (label.includes('Hari ini')) {
      setActiveTab('harian')
    } else if (label.includes('30 hari') || label.includes('Bulan')) {
      setActiveTab('ringkasan')
    }
    showToast(`Periode laporan diubah: ${label}`, 'info')
  }

  // Handler Ekspor Excel (CSV dengan UTF-8 BOM untuk Excel)
  const handleExportExcel = () => {
    const bom = '\uFEFF'
    let csvContent = bom
    csvContent += 'LAPORAN REKAPITULASI SKRINING MEASLESCARE\n'
    csvContent += `Periode;${currentData.dateRange}\n`
    csvContent += `Tanggal Cetak;${new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}\n\n`

    csvContent += 'RINGKASAN STATISTIK\n'
    csvContent += `Total Skrining;${currentData.totalSkrining}\n`
    csvContent += `Belum Memenuhi Kriteria;${currentData.belumMemenuhiKriteria.jumlah};${currentData.belumMemenuhiKriteria.persentase}%\n`
    csvContent += `Mengarah ke Suspek;${currentData.mengarahSuspek.jumlah};${currentData.mengarahSuspek.persentase}%\n`
    csvContent += `Perlu Penanganan Segera;${currentData.penangananSegera.jumlah};${currentData.penangananSegera.persentase}%\n\n`

    csvContent += 'TREN DATA SKRINING\n'
    csvContent += 'Periode;Jumlah Skrining;Non-Suspek;Suspek;Penanganan Segera\n'
    currentData.trenData.forEach((t) => {
      csvContent += `${t.label};${t.value};${t.kriteriaNonSuspek ?? '-'};${t.suspek ?? '-'};${t.penangananSegera ?? '-'}\n`
    })
    csvContent += '\n'

    csvContent += 'GEJALA PALING BANYAK DITEMUKAN\n'
    csvContent += 'Nama Gejala;Jumlah Kasus;Persentase\n'
    currentData.gejalaTerbanyak.forEach((g) => {
      csvContent += `${g.nama};${g.count};${g.percent}%\n`
    })
    csvContent += '\n'

    csvContent += 'INSIGHT & EVALUASI KLINIS AWAL\n'
    currentData.insights.forEach((ins) => {
      csvContent += `- ${ins}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Laporan-Skrining-MeaslesCare-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast('File Excel (CSV) berhasil diunduh!')
  }

  // Handler Cetak / Ekspor PDF
  const handlePrintPdf = () => {
    window.print()
    setIsPdfModalOpen(false)
    showToast('Laporan PDF siap dicetak / disimpan!')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Alert Popups */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none print:hidden">
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

      {/* Header Halaman & Date Range Picker */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
            <Link to="/admin" className="transition-colors hover:text-primary">
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-text">Laporan & Statistik</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Laporan & Statistik
          </h1>
          <p className="mt-1 text-sm text-muted">
            Rekap dan analisis hasil skrining campak di fasilitas kesehatan.
          </p>
        </div>

        {/* Date Range Picker Dropdown (Sudut Kanan Atas Sesuai Gambar) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="flex min-h-11 items-center gap-2.5 rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-xs font-semibold text-text shadow-xs transition hover:border-action"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-action">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span className="tabular">{dateRangeSelection}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-slate-400">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Date Picker Popover Menu */}
          {isDatePickerOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDatePickerOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-border-soft bg-surface p-2 shadow-pop">
                <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Pilih Rentang Waktu
                </p>
                <div className="space-y-1">
                  {[
                    'Hari Ini (12 Nov 2026)',
                    '7 Hari Terakhir (6 - 12 Nov 2026)',
                    '30 Hari Terakhir (13 Okt - 12 Nov 2026)',
                    'Bulan ini (1 - 12 Nov 2026)',
                    'Bulan sebelumnya (Oktober 2026)',
                  ].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSelectDateRange(label)}
                      className={cn(
                        'w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition',
                        dateRangeSelection === label
                          ? 'bg-blue-50 text-action font-semibold'
                          : 'text-text hover:bg-surface-muted',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-border-soft pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDatePickerOpen(false)
                        setIsCustomModalOpen(true)
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-action hover:bg-blue-50 transition"
                    >
                      + Rentang Tanggal Khusus...
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigasi Tab Jenis Laporan & Tombol Ekspor (Baris di bawah header) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tab Navigasi: Ringkasan, Laporan Harian, Laporan Mingguan, Laporan Bulanan */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ringkasan')}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-xs',
              activeTab === 'ringkasan'
                ? 'bg-action text-white'
                : 'border border-border-soft bg-surface text-slate-600 hover:bg-surface-muted hover:text-text',
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            <span>Ringkasan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('harian')}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-xs',
              activeTab === 'harian'
                ? 'bg-action text-white'
                : 'border border-border-soft bg-surface text-slate-600 hover:bg-surface-muted hover:text-text',
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <span>Laporan Harian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mingguan')}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-xs',
              activeTab === 'mingguan'
                ? 'bg-action text-white'
                : 'border border-border-soft bg-surface text-slate-600 hover:bg-surface-muted hover:text-text',
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
            </svg>
            <span>Laporan Mingguan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bulanan')}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-xs',
              activeTab === 'bulanan'
                ? 'bg-action text-white'
                : 'border border-border-soft bg-surface text-slate-600 hover:bg-surface-muted hover:text-text',
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18M8 2v4M16 2v4" />
            </svg>
            <span>Laporan Bulanan</span>
          </button>
        </div>

        {/* Tombol Ekspor Excel & PDF (Sisi Kanan) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-soft bg-surface px-4 py-2 text-xs font-semibold text-text shadow-xs transition hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
          >
            {/* Green Excel icon */}
            <span className="grid size-5 place-items-center rounded bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" x2="16" y1="13" y2="13" />
                <line x1="8" x2="16" y1="17" y2="17" />
              </svg>
            </span>
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-soft bg-surface px-4 py-2 text-xs font-semibold text-text shadow-xs transition hover:border-rose-500 hover:text-rose-700 hover:bg-rose-50"
          >
            {/* Red PDF icon */}
            <span className="grid size-5 place-items-center rounded bg-rose-100 text-rose-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M10 12h2a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-2v-4h2" />
              </svg>
            </span>
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik (4 Kartu persis seperti referensi) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Kartu 1: Total Skrining */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-action/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Total Skrining
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                ↑ +{currentData.pertambahan}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">
              {currentData.totalSkrining.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-muted">pada periode terpilih</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M3 19c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" />
              <path d="M16 11a3 3 0 1 0-1.2-5.5M17.5 19c-.3-1.8-1.2-3.2-2.5-4" />
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
                {currentData.belumMemenuhiKriteria.persentase.toFixed(1).replace('.', ',')}%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">
              {currentData.belumMemenuhiKriteria.jumlah.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-muted">dari total skrining</p>
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
                {currentData.mengarahSuspek.persentase.toFixed(1).replace('.', ',')}%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">
              {currentData.mengarahSuspek.jumlah.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-muted">dari total skrining</p>
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
                {currentData.penangananSegera.persentase.toFixed(1).replace('.', ',')}%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">
              {currentData.penangananSegera.jumlah.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-muted">dari total skrining</p>
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

      {/* Middle Row: Tren Jumlah Skrining (Kiri) + Distribusi Hasil Skrining (Kanan) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card Kiri: Tren Jumlah Skrining */}
        <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card lg:col-span-7">
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Tren Jumlah Skrining</h2>
              <p className="text-xs text-muted">
                Dinamika volume skrining {currentData.periodeLabel.toLowerCase()}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <TrendLineChart data={currentData.trenData} height={240} />
          </div>
        </div>

        {/* Card Kanan: Distribusi Hasil Skrining */}
        <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Distribusi Hasil Skrining</h2>
              <p className="text-xs text-muted">Proporsi kategori klasifikasi skrining awal</p>
            </div>
          </div>

          <div className="mt-4 flex-1 flex items-center justify-center">
            <DonutDistributionChart
              total={currentData.totalSkrining}
              belumMemenuhi={currentData.belumMemenuhiKriteria}
              suspek={currentData.mengarahSuspek}
              segera={currentData.penangananSegera}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: 3 Cards (Gejala Paling Banyak, Rekap per Kategori, Insight Periode Ini) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1: Gejala Paling Banyak Ditemukan */}
        <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card lg:col-span-4">
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">Gejala Paling Banyak Ditemukan</h3>
              <p className="text-[11px] text-muted">Frekuensi gejala pada pasien skrining</p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            {currentData.gejalaTerbanyak.map((g) => (
              <div key={g.nama} className="flex items-center gap-3 text-xs">
                {/* Gejala Icon */}
                <span className="grid size-6 shrink-0 place-items-center text-muted">
                  {g.iconName === 'demam' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-rose-500">
                      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                    </svg>
                  )}
                  {g.iconName === 'batuk' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-blue-500">
                      <path d="m14 19-3-3m0 0-3-3m3 3 3-3m-3 3-3 3" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  {g.iconName === 'pilek' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-cyan-500">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  )}
                  {g.iconName === 'mata' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-amber-500">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                  {g.iconName === 'ruam' && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-purple-500">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h.01M12 8h.01M12 16h.01M16 12h.01" />
                    </svg>
                  )}
                </span>

                {/* Nama Gejala */}
                <span className="w-24 shrink-0 font-medium text-text">{g.nama}</span>

                {/* Horizontal Progress Bar */}
                <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-action transition-all duration-500"
                    style={{ width: `${g.percent}%` }}
                  />
                </div>

                {/* Persentase */}
                <span className="w-12 shrink-0 text-right font-bold tabular text-text">
                  {g.percent.toFixed(1).replace('.', ',')}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Rekap Skrining per Kategori */}
        <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card lg:col-span-4">
          <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
            <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-action">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect width="8" height="4" x="8" y="2" rx="1" />
                <path d="m9 14 2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-text">Rekap Skrining per Kategori</h3>
              <p className="text-[11px] text-muted">Ringkasan tabulasi seluruh kategori</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border-soft text-muted font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5">Kategori Hasil</th>
                  <th className="pb-2.5 text-right">Jumlah</th>
                  <th className="pb-2.5 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/60">
                {currentData.kategoriRekap.map((row) => (
                  <tr key={row.kategori} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 font-medium text-text flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ background: row.color }} />
                      <span>{row.kategori}</span>
                    </td>
                    <td className="py-2.5 text-right font-semibold tabular text-text">
                      {row.jumlah.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 text-right font-bold tabular text-text">
                      {row.persentase.toFixed(1).replace('.', ',')}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border-soft font-bold text-text">
                  <td className="pt-3 font-bold">Total</td>
                  <td className="pt-3 text-right tabular">
                    {currentData.totalSkrining.toLocaleString('id-ID')}
                  </td>
                  <td className="pt-3 text-right tabular text-action">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Card 3: Insight Periode Ini */}
        <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-card lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 border-b border-border-soft pb-4">
              <div className="grid size-8 place-items-center rounded-xl bg-blue-50 text-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                  <path d="M9.5 17h5M10 20h4M12 3a6 6 0 0 1 3.6 10.8c-.6.5-.9 1-.9 1.7H9.3c0-.7-.3-1.2-.9-1.7A6 6 0 0 1 12 3Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-text">Insight Periode Ini</h3>
                <p className="text-[11px] text-muted">Analisis otomatis berbasis data agregat</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {currentData.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600 mt-0.5 font-bold text-[10px]">
                    ✓
                  </span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-border-soft pt-3 text-[11px] text-muted italic">
            Hasil skrining merupakan skrining awal pendukung dan bukan diagnosis medis final.
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL 1: Rentang Tanggal Khusus
      ======================================================== */}
      {isCustomModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsCustomModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <h3 className="text-base font-bold text-text">Pilih Rentang Tanggal Khusus</h3>
            <p className="mt-1 text-xs text-muted">
              Tentukan periode tanggal laporan yang ingin dianalisis.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateRangeSelection(`${customStart} – ${customEnd}`)
                  setIsCustomModalOpen(false)
                  showToast(`Rentang tanggal disetel: ${customStart} s/d ${customEnd}`)
                }}
                className="min-h-9 rounded-xl bg-action px-4 text-xs font-semibold text-white shadow-sm hover:bg-action-hover"
              >
                Terapkan Periode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: Pratinjau Ekspor PDF & Cetak Resmi
      ======================================================== */}
      {isPdfModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsPdfModalOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-border-soft bg-surface p-6 shadow-pop my-8">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h3 className="text-base font-bold text-text">Pratinjau Dokumen Laporan (PDF)</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Format resmi rekapitulasi skrining campak MeaslesCare fasyankes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Dokumen Laporan Kertas Standar Fasyankes */}
            <div className="mt-5 rounded-xl border border-slate-300 bg-white p-6 text-xs text-slate-800 shadow-inner space-y-4 font-sans">
              {/* Kop Surat Fasyankes */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-blue-600 text-white font-bold text-lg">
                    +
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                      MeaslesCare · Fasilitas Pelayanan Kesehatan
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Sistem Skrining Awal Campak Berbasis Kiosk Terpadu
                    </p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <p>Tanggal: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date())}</p>
                  <p>Kode Dok: MC-RPT-2026</p>
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center py-1">
                <h5 className="text-sm font-bold uppercase text-slate-900">
                  Laporan Rekapitulasi & Analisis Skrining Campak
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  Periode Laporan: <span className="font-semibold">{currentData.dateRange}</span> ({currentData.periodeLabel})
                </p>
              </div>

              {/* Ringkasan 4 Angka Kunci */}
              <div className="grid grid-cols-4 gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Total Skrining</p>
                  <p className="text-base font-bold text-slate-900">{currentData.totalSkrining.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Non-Suspek</p>
                  <p className="text-base font-bold text-emerald-600">
                    {currentData.belumMemenuhiKriteria.jumlah} ({currentData.belumMemenuhiKriteria.persentase}%)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Mengarah Suspek</p>
                  <p className="text-base font-bold text-amber-600">
                    {currentData.mengarahSuspek.jumlah} ({currentData.mengarahSuspek.persentase}%)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Tanda Bahaya</p>
                  <p className="text-base font-bold text-rose-600">
                    {currentData.penangananSegera.jumlah} ({currentData.penangananSegera.persentase}%)
                  </p>
                </div>
              </div>

              {/* Tabel Distribusi Hasil */}
              <div>
                <p className="font-bold text-slate-900 mb-1.5">1. Rekapitulasi Kategori Hasil Skrining</p>
                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-2 text-left">Kategori Klasifikasi</th>
                      <th className="border border-slate-300 p-2 text-right">Jumlah Pasien</th>
                      <th className="border border-slate-300 p-2 text-right">Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.kategoriRekap.map((k) => (
                      <tr key={k.kategori}>
                        <td className="border border-slate-300 p-2 font-medium">{k.kategori}</td>
                        <td className="border border-slate-300 p-2 text-right tabular">{k.jumlah.toLocaleString('id-ID')}</td>
                        <td className="border border-slate-300 p-2 text-right tabular">{k.persentase}%</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td className="border border-slate-300 p-2">Total Seluruh Skrining</td>
                      <td className="border border-slate-300 p-2 text-right tabular">{currentData.totalSkrining.toLocaleString('id-ID')}</td>
                      <td className="border border-slate-300 p-2 text-right tabular">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rekap Gejala */}
              <div>
                <p className="font-bold text-slate-900 mb-1.5">2. Rekap Gejala Paling Sering Ditemukan</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {currentData.gejalaTerbanyak.map((g) => (
                    <div key={g.nama} className="flex justify-between border-b border-slate-200 pb-1">
                      <span>• {g.nama}</span>
                      <span className="font-semibold">{g.count} kasus ({g.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Hukum & Klinis */}
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
                <strong>Catatan Legalitas & Klinis:</strong> Dokumen ini merupakan hasil kompilasi skrining awal berbasis kiosk MeaslesCare yang ditujukan untuk keperluan pemantauan surveilans fasyankes dan bukan merupakan diagnosis klinis final bagi pasien.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-action px-5 text-xs font-semibold text-white shadow-sm hover:bg-action-hover"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect width="12" height="8" x="6" y="14" />
                </svg>
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

