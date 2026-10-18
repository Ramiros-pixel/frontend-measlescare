import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

const MAX_FILE_MB = 5

interface PhotoPickerProps {
  onPick: (file: File) => void
  busy?: boolean
  error?: string
  className?: string
}

// Jalur cadangan bila kamera perangkat tidak tersedia atau izinnya ditolak.
export function PhotoPicker({ onPick, busy, error, className }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleChange = (files: FileList | null) => {
    setLocalError(null)
    const file = files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLocalError('Berkas harus berupa gambar.')
      return
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setLocalError(`Ukuran berkas melebihi ${MAX_FILE_MB} MB.`)
      return
    }
    onPick(file)
  }

  const shown = error ?? localError ?? undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          handleChange(e.target.files)
          e.target.value = ''
        }}
      />
      <Button variant="secondary" onClick={() => inputRef.current?.click()} loading={busy}>
        Unggah foto
      </Button>
      {shown && (
        <p role="alert" className="text-xs font-medium text-danger">
          {shown}
        </p>
      )}
    </div>
  )
}
