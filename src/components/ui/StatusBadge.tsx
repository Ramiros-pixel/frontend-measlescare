import { cn } from '@/lib/cn'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusBadgeProps {
  tone: Tone
  icon: React.ReactNode
  label: string
  className?: string
}

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  success: { bg: 'bg-success-soft', fg: 'text-success', border: 'border-success' },
  warning: { bg: 'bg-warning-soft', fg: 'text-warning', border: 'border-warning' },
  danger: { bg: 'bg-danger-soft', fg: 'text-danger', border: 'border-danger' },
  info: { bg: 'bg-info-soft', fg: 'text-info', border: 'border-info' },
  neutral: { bg: 'bg-surface-muted', fg: 'text-muted', border: 'border-border' },
}

// Status tidak dibedakan warna saja: selalu ikon + teks (syarat scope desain).
export function StatusBadge({ tone, icon, label, className }: StatusBadgeProps) {
  const t = TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold',
        t.bg,
        t.fg,
        t.border,
        className,
      )}
    >
      <span aria-hidden className="size-3.5 shrink-0">
        {icon}
      </span>
      {label}
    </span>
  )
}
