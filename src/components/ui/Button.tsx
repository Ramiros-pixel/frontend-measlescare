import { cn } from '@/lib/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'md' | 'lg'
  loading?: boolean
}

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-text hover:border-primary hover:text-primary',
  ghost: 'text-primary hover:bg-primary-soft',
  danger: 'bg-danger text-white hover:opacity-90',
} as const

// Tinggi minimum 44px agar jadi tap target yang aman di ponsel (R-03).
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold',
        'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55',
        VARIANTS[variant],
        size === 'lg' && 'min-h-12 px-5 text-base',
        className,
      )}
      {...rest}
    >
      {loading && <span aria-hidden className="spinner size-4" />}
      {children}
    </button>
  )
}
