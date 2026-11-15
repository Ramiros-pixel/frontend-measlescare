import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

interface SimulasiBadgeProps {
  label?: string
  className?: string
}

/*
 * Penanda data simulasi. Wajib dipakai pada setiap bagian yang datanya
 * belum berasal dari backend, supaya tidak tertukar dengan data asli.
 */
export function SimulasiBadge({ label = 'Data simulasi', className }: SimulasiBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="size-3.5">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5m0-8.5v.01" />
      </svg>
      {label}
    </span>
  )
}

interface CatatanDataProps {
  children: React.ReactNode
  className?: string
}

/* Catatan kecil yang menjelaskan asal dan cakupan data sebuah angka. */
export function CatatanData({ children, className }: CatatanDataProps) {
  return (
    <p className={cn('flex items-start gap-1.5 text-xs text-muted', className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
        className="mt-0.5 size-3.5 shrink-0"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 11v5m0-8.5v.01" />
      </svg>
      <span>{children}</span>
    </p>
  )
}
