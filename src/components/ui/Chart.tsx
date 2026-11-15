import { useId } from 'react'
import { cn } from '@/lib/cn'
import { formatAngka } from '@/lib/format'

/* =========================================================
   Grafik admin digambar sendiri sebagai SVG: proyek tidak
   memakai library chart, dan data yang ditampilkan kecil
   (tren 7 hari, distribusi 3 kategori, gejala, storage).
========================================================= */

export interface TrendPoint {
  label: string
  value: number
}

interface LineAreaChartProps {
  data: TrendPoint[]
  height?: number
  className?: string
}

export function LineAreaChart({ data, height = 220, className }: LineAreaChartProps) {
  const gradId = useId()
  const w = 640
  const h = height
  const padX = 34
  const padTop = 16
  const padBottom = 26

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Belum ada data untuk ditampilkan.</p>
  }

  const max = Math.max(...data.map((d) => d.value), 1)
  const stepX = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0
  const px = (i: number) => padX + i * stepX
  const py = (v: number) => padTop + (1 - v / max) * (h - padTop - padBottom)

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.value).toFixed(1)}`).join(' ')
  const area = `${line} L${px(data.length - 1).toFixed(1)},${h - padBottom} L${padX},${h - padBottom} Z`

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Grafik tren">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={padX} x2={w - padX} y1={py(t)} y2={py(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={padX - 8} y={py(t) + 4} textAnchor="end" fontSize="10" fill="#64748b">
              {formatAngka(t)}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {data.map((d, i) => (
          <g key={d.label}>
            <circle cx={px(i)} cy={py(d.value)} r={i === data.length - 1 ? 4.5 : 3.5} fill="#2563eb" />
            <text x={px(i)} y={h - 8} textAnchor="middle" fontSize="10" fill="#64748b">
              {d.label}
            </text>
          </g>
        ))}

        {data.length > 0 && (
          <g>
            <rect
              x={px(data.length - 1) - 17}
              y={py(data[data.length - 1].value) - 26}
              width="34"
              height="18"
              rx="5"
              fill="#2563eb"
            />
            <text
              x={px(data.length - 1)}
              y={py(data[data.length - 1].value) - 13}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#ffffff"
            >
              {formatAngka(data[data.length - 1].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  centerLabel?: string
  centerValue?: string
  size?: number
  className?: string
}

export function DonutChart({ segments, centerLabel, centerValue, size = 180, className }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const r = 60
  const stroke = 22
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-6', className)}>
      <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label="Diagram distribusi">
        <g transform="translate(80,80) rotate(-90)">
          <circle r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
          {total > 0 &&
            segments.map((s) => {
              const portion = s.value / total
              const dash = portion * c
              const el = (
                <circle
                  key={s.label}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${c - dash}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += dash
              return el
            })}
        </g>
        {centerValue && (
          <>
            <text x="80" y="76" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">
              {centerValue}
            </text>
            {centerLabel && (
              <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#64748b">
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>

      <ul className="flex flex-col gap-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-text">{s.label}</span>
            <span className="tabular font-semibold text-muted">
              {formatAngka(s.value)} ({total > 0 ? `${((s.value / total) * 100).toFixed(1).replace('.', ',')}%` : '0%'})
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface BarItem {
  label: string
  value: number
  percent: number
  icon?: React.ReactNode
}

interface BarListProps {
  items: BarItem[]
  className?: string
}

export function BarList({ items, className }: BarListProps) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Belum ada data gejala.</p>
  }
  const max = Math.max(...items.map((i) => i.percent), 1)

  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          {item.icon && <span aria-hidden className="shrink-0 text-action">{item.icon}</span>}
          <span className="w-24 shrink-0 text-sm text-text">{item.label}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <span
              className="block h-full rounded-full bg-action"
              style={{ width: `${Math.max(2, (item.percent / max) * 100)}%` }}
            />
          </span>
          <span className="tabular w-14 shrink-0 text-right text-sm font-semibold text-text">
            {item.percent.toFixed(1).replace('.', ',')}%
          </span>
        </li>
      ))}
    </ul>
  )
}

interface StorageDonutProps {
  usedGb: number
  totalGb: number
  label?: string
  className?: string
}

export function StorageDonut({ usedGb, totalGb, label = 'Penyimpanan', className }: StorageDonutProps) {
  const percent = totalGb > 0 ? (usedGb / totalGb) * 100 : 0
  const r = 42
  const c = 2 * Math.PI * r

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <svg viewBox="0 0 120 120" width="96" height="96" role="img" aria-label={`${label} ${percent.toFixed(0)}%`}>
        <g transform="translate(60,60) rotate(-90)">
          <circle r={r} fill="none" stroke="#eef2f7" strokeWidth="14" />
          <circle
            r={r}
            fill="none"
            stroke="#2563eb"
            strokeWidth="14"
            strokeDasharray={`${(percent / 100) * c} ${c}`}
            strokeLinecap="round"
          />
        </g>
        <text x="60" y="58" textAnchor="middle" fontSize="17" fontWeight="700" fill="#0f172a">
          {percent.toFixed(0)}%
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="9" fill="#64748b">
          {label}
        </text>
      </svg>
      <p className="tabular text-sm text-muted">
        {usedGb.toFixed(1).replace('.', ',')} GB / {totalGb.toFixed(0)} GB terpakai
      </p>
    </div>
  )
}
