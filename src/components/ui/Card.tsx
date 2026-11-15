import { cn } from '@/lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn('rounded-xl border border-border-soft bg-surface shadow-card', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function CardHeader({ title, description, icon, actions, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3 px-5 py-4', className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icon && <span aria-hidden className="mt-0.5 text-action">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-text">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
