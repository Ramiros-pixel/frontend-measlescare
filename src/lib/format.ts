interface FormatDateOptions {
  withTime?: boolean
}

const DT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
}

const DT_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
}

export function formatTanggal(iso: string | null | undefined, opts: FormatDateOptions = {}): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const fmt = new Intl.DateTimeFormat('id-ID', {
    ...DT_OPTIONS,
    ...(opts.withTime ? DT_TIME_OPTIONS : {}),
  })
  return fmt.format(d)
}

// Angka pada area admin mengikuti format Indonesia (pemisah ribuan titik,
// desimal koma) seperti pada gambar referensi.
export function formatAngka(nilai: number | null | undefined): string {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) return '-'
  return new Intl.NumberFormat('id-ID').format(nilai)
}

export function formatPersen(nilai: number | null | undefined, desimal = 1): string {
  if (nilai === null || nilai === undefined || Number.isNaN(nilai)) return '-'
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(nilai)}%`
}

export function formatSuhu(suhu: number | null | undefined): string {
  if (suhu === null || suhu === undefined) return ''
  return `${suhu.toFixed(1).replace('.', ',')} °C`
}
