import { cn } from '@/lib/cn'

interface ErrorNoteProps {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

// Pesan error selalu menyebut sebab dan aksi lanjut (R-27); status tidak
// disampaikan lewat warna saja, ada ikon dan teks.
export function ErrorNote({ title = 'Gagal memuat data', message, onRetry, retrying, className }: ErrorNoteProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col gap-2 rounded-lg border border-danger bg-danger-soft p-4', className)}
    >
      <div className="flex items-start gap-2">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="mt-0.5 size-5 shrink-0 text-danger">
          <path
            d="M12 9v4m0 3.5v.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-danger">{title}</p>
          <p className="text-sm text-danger">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="self-start rounded-md border border-danger px-3 py-1.5 text-sm font-semibold text-danger hover:bg-danger hover:text-white disabled:opacity-55"
        >
          {retrying ? 'Mencoba...' : 'Coba lagi'}
        </button>
      )}
    </div>
  )
}

interface EmptyNoteProps {
  title: string
  message: string
  action?: React.ReactNode
  className?: string
}

export function EmptyNote({ title, message, action, className }: EmptyNoteProps) {
  return (
    <div className={cn('flex flex-col items-center gap-1.5 rounded-lg border border-border-soft bg-surface p-6 text-center', className)}>
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
