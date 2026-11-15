import { cn } from '@/lib/cn'

export type StatTone = 'action' | 'success' | 'warning' | 'danger' | 'neutral'

const TONE: Record<StatTone, { icon: string; badge: string }> = {
  action: { icon: 'bg-action-soft text-action', badge: 'bg-action-soft text-action' },
  success: { icon: 'bg-success-soft text-success', badge: 'bg-success-soft text-success' },
  warning: { icon: 'bg-warning-soft text-warning', badge: 'bg-warning-soft text-warning' },
  danger: { icon: 'bg-danger-soft text-danger', badge: 'bg-danger-soft text-danger' },
  neutral: { icon: 'bg-surface-muted text-muted', badge: 'bg-surface-muted text-muted' },
}

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon?: React.ReactNode
  badge?: string
  badgeTone?: StatTone
  tone?: StatTone
  loading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  badge,
  badgeTone = 'neutral',
  tone = 'action',
  loading = false,
  className,
}: StatCardProps) {
  const t = TONE[tone]
  return (
    <div className={cn('rounded-xl border border-border-soft bg-surface p-4 shadow-card', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {icon && (
          <span aria-hidden className={cn('grid size-9 shrink-0 place-items-center rounded-lg', t.icon)}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="tabular text-2xl font-bold text-text">{loading ? '—' : value}</span>
        {badge && (
          <span className={cn('rounded-md px-1.5 py-0.5 text-xs font-bold', TONE[badgeTone].badge)}>
            {badge}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
