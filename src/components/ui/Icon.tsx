import { cn } from '@/lib/cn'

export type IconName =
  | 'dashboard'
  | 'pasien'
  | 'skrining'
  | 'laporan'
  | 'kiosk'
  | 'pengguna'
  | 'pengaturan'
  | 'keluar'
  | 'kalender'
  | 'lonceng'
  | 'plus'
  | 'refresh'
  | 'unduh'
  | 'cari'
  | 'mata'
  | 'edit'
  | 'hapus'
  | 'tutup'
  | 'ceklis'
  | 'silang'
  | 'peringatan'
  | 'info'
  | 'termometer'
  | 'kamera'
  | 'monitor'
  | 'building'
  | 'lampu'
  | 'jam'
  | 'pencermin'
  | 'chevron-kanan'
  | 'chevron-bawah'
  | 'upload'
  | 'trash'
  | 'lapisan'
  | 'user'

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: <><path d="M4 11.5 12 4l8 7.5" /><path d="M6.5 10.5V20h11v-9.5" /></>,
  pasien: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19.5c.8-3.4 3-5.2 5.5-5.2s4.7 1.8 5.5 5.2" /><path d="M16 11a3 3 0 1 0-1.5-5.5M17.5 19c-.3-1.7-1-3-2-3.9" /></>,
  skrining: <><path d="M6 3.5h9l4 4V20.5H6z" /><path d="M14.5 3.5v4h4" /><path d="M9 12h6M9 15.5h4" /></>,
  laporan: <><path d="M4 19.5h16" /><path d="M7 16V9M12 16V5M17 16v-4" /></>,
  kiosk: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  pengguna: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.9-3.8 3.5-5.7 7-5.7s6.1 1.9 7 5.7" /></>,
  pengaturan: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" /></>,
  keluar: <><path d="M14 4H6v16h8" /><path d="M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5" /></>,
  kalender: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  lonceng: <><path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  refresh: <><path d="M20 11a8 8 0 1 0-1.5 5.5" /><path d="M20 5v6h-6" /></>,
  unduh: <><path d="M12 4v11m0 0 4-4m-4 4-4-4" /><path d="M5 19h14" /></>,
  cari: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  mata: <><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></>,
  edit: <><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m14.5 7.5 2.5 2.5" /></>,
  hapus: <><path d="M4.5 6.5h15M9.5 6.5V4.8h5v1.7M6.5 6.5 7.4 20h9.2l.9-13.5" /><path d="M10.5 10v6M13.5 10v6" /></>,
  tutup: <><path d="m6 6 12 12M18 6 6 18" /></>,
  ceklis: <><path d="m5 13 4 4L19 7" /></>,
  silang: <><circle cx="12" cy="12" r="8.5" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  peringatan: <><path d="M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 3.5v.01" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5m0-8.5v.01" /></>,
  termometer: <><path d="M13.5 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z" /><path d="M11.5 17.5v.01" /></>,
  kamera: <><path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10H4z" /><circle cx="12" cy="13" r="3.2" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  building: <><path d="M4 20V6l8-3 8 3v14" /><path d="M9 20v-5h6v5M8 9h2M14 9h2M8 12h2M14 12h2" /></>,
  lampu: <><path d="M9.5 17h5M10 20h4" /><path d="M12 3a6 6 0 0 1 3.6 10.8c-.6.5-.9 1-.9 1.7H9.3c0-.7-.3-1.2-.9-1.7A6 6 0 0 1 12 3Z" /></>,
  jam: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  pencermin: <><path d="M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18Z" /><path d="M12 3v18" /><path d="M3.5 12h17" /></>,
  'chevron-kanan': <><path d="m9 5 7 7-7 7" /></>,
  'chevron-bawah': <><path d="m5 9 7 7 7-7" /></>,
  upload: <><path d="M12 16V5m0 0 4 4m-4-4-4 4" /><path d="M5 19h14" /></>,
  trash: <><path d="M4.5 6.5h15M9.5 6.5V4.8h5v1.7M6.5 6.5 7.4 20h9.2l.9-13.5" /></>,
  lapisan: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  user: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.9-3.8 3.5-5.7 7-5.7s6.1 1.9 7 5.7" /></>,
}

interface IconProps {
  name: IconName
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('size-5', className)}
    >
      {PATHS[name]}
    </svg>
  )
}
