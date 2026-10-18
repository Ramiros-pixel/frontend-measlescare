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

export function formatSuhu(suhu: number | null | undefined): string {
  if (suhu === null || suhu === undefined) return ''
  return `${suhu.toFixed(1).replace('.', ',')} °C`
}
