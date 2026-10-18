// Pemetaan status bebas-teks dari backend ke label, nada, dan ikon UI.
// Nilai di luar daftar jatuh ke tone info dengan teks apa adanya.
export type CameraTone = 'success' | 'warning' | 'danger' | 'info'

const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <path
        d="M12 9v4m0 3.5v.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <path d="M12 8v5m0 3.5v.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
      <path d="M12 8h.01M11 12h1v4h1m-1-9a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const CAMERA_STATUS_MAP: Record<string, { tone: CameraTone; label: string }> = {
  normal: { tone: 'success', label: 'Kamera: normal' },
  'terdeteksi mengantuk': { tone: 'warning', label: 'Kamera: terdeteksi mengantuk' },
  mengantuk: { tone: 'warning', label: 'Kamera: mengantuk' },
}

export function cameraStatusView(status: string | null | undefined): {
  tone: CameraTone | 'neutral'
  icon: React.ReactNode
  label: string
} {
  if (!status) {
    return { tone: 'neutral', icon: ICONS.info, label: 'Kamera: belum ada status' }
  }
  const mapped = CAMERA_STATUS_MAP[status.toLowerCase()]
  if (mapped) return { tone: mapped.tone, icon: ICONS[mapped.tone], label: mapped.label }
  return { tone: 'info', icon: ICONS.info, label: `Kamera: ${status}` }
}
