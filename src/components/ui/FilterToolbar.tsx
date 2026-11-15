import { cn } from '@/lib/cn'

interface FilterToolbarProps {
  children: React.ReactNode
  onReset?: () => void
  hasActiveFilter?: boolean
  className?: string
}

export function FilterToolbar({ children, onReset, hasActiveFilter = false, className }: FilterToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2.5 border-b border-border-soft px-5 py-3.5', className)}>
      {children}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilter}
          className="text-sm font-semibold text-action underline-offset-2 transition-colors duration-150 hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
        >
          Reset
        </button>
      )}
    </div>
  )
}
