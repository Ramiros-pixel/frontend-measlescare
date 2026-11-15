import { cn } from '@/lib/cn'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex flex-wrap gap-1 rounded-xl border border-border-soft bg-surface p-1 shadow-card',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors duration-150',
              active ? 'bg-action text-white' : 'text-muted hover:bg-surface-muted hover:text-text',
              item.disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {item.icon && <span aria-hidden className="size-4">{item.icon}</span>}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
