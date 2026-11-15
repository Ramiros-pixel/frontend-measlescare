import { cn } from '@/lib/cn'
import { formatAngka } from '@/lib/format'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
  label?: string
}

export function Pagination({ page, pageSize, total, onPageChange, className, label = 'data' }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const pages: (number | 'gap')[] = []
  const push = (n: number | 'gap') => pages.push(n)
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i += 1) push(i)
  } else {
    push(1)
    if (page > 3) push('gap')
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i += 1) push(i)
    if (page < pageCount - 2) push('gap')
    push(pageCount)
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-5 py-3',
        className,
      )}
    >
      <p className="tabular text-sm text-muted">
        Menampilkan {formatAngka(start)} – {formatAngka(end)} dari {formatAngka(total)} {label}
      </p>
      <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="grid size-9 place-items-center rounded-md border border-border-soft text-muted transition-colors duration-150 hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹
        </button>
        {pages.map((item, idx) =>
          item === 'gap' ? (
            <span key={`gap-${idx}`} className="px-1 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                'tabular grid size-9 place-items-center rounded-md border text-sm font-semibold transition-colors duration-150',
                item === page
                  ? 'border-action bg-action text-white'
                  : 'border-border-soft text-muted hover:border-action hover:text-action',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="grid size-9 place-items-center rounded-md border border-border-soft text-muted transition-colors duration-150 hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
        >
          ›
        </button>
      </nav>
    </div>
  )
}
