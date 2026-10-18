import type { HistoryItem } from '@/api/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { cameraStatusView } from '@/lib/status'
import { formatTanggal, formatSuhu } from '@/lib/format'

export function CameraStatusBadge({ status }: { status: string | null | undefined }) {
  const view = cameraStatusView(status)
  return <StatusBadge tone={view.tone} icon={view.icon} label={view.label} />
}

// Satu baris ringkas per catatan gejala; dipakai di riwayat dan hasil.
export function GejalaSummary({ item }: { item: HistoryItem }) {
  return (
    <p className="text-sm text-muted">
      {formatTanggal(item.Tanggal, { withTime: true })}
      {item.Suhu !== null && <> · Suhu {formatSuhu(item.Suhu)}</>}
      {item.Batuk && <> · Batuk {item.Batuk}</>}
      {!item.cameras.length && ' · Belum ada deteksi kamera'}
    </p>
  )
}
