import { cn } from '@/lib/cn'
import { Loader } from '@/components/ui/Loader'

export function FullPageLoader({ label = 'Memuat' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-dvh flex-col items-center justify-center gap-3 text-muted"
    >
      <Loader className="size-6" />
      <p className="text-sm">{label}...</p>
    </div>
  )
}

export function InlineLoader({ label, className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex items-center gap-2 text-sm text-muted', className)}>
      <Loader className="size-4" />
      <span>{label ?? 'Memuat...'}</span>
    </div>
  )
}

export function SkeletonLine({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton h-4 rounded-sm', className)} />
}
