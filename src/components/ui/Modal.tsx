import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-slate-900/45" />
      <div className="relative w-full max-w-lg rounded-xl border border-border-soft bg-surface shadow-pop">
        <header className="border-b border-border-soft px-5 py-4">
          <h2 className="text-base font-bold text-text">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-border-soft px-5 py-4">{footer}</footer>}
      </div>
    </div>
  )
}
