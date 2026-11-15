export interface TrendPoint {
  label: string
  value: number
  kriteriaNonSuspek?: number
  suspek?: number
  penangananSegera?: number
}

export interface SymptomStat {
  nama: string
  iconName: 'demam' | 'batuk' | 'pilek' | 'mata' | 'ruam'
  count: number
  percent: number
}

export interface CategorySummary {
  kategori: string
  jumlah: number
  persentase: number
  color: string
}

export interface ReportDataSet {
  periodeLabel: string
  dateRange: string
  totalSkrining: number
  pertambahan: number
  belumMemenuhiKriteria: {
    jumlah: number
    persentase: number
  }
  mengarahSuspek: {
    jumlah: number
    persentase: number
  }
  penangananSegera: {
    jumlah: number
    persentase: number
  }
  trenData: TrendPoint[]
  gejalaTerbanyak: SymptomStat[]
  kategoriRekap: CategorySummary[]
  insights: string[]
}

// Data Ringkasan (Default - Periode 1 Nov 2026 - 12 Nov 2026 sesuai gambar referensi)
export const RINGKASAN_DATA: ReportDataSet = {
  periodeLabel: 'Ringkasan Periode Berjalan',
  dateRange: '1 Nov 2026 – 12 Nov 2026',
  totalSkrining: 1842,
  pertambahan: 86,
  belumMemenuhiKriteria: {
    jumlah: 1387,
    persentase: 75.3,
  },
  mengarahSuspek: {
    jumlah: 367,
    persentase: 19.9,
  },
  penangananSegera: {
    jumlah: 88,
    persentase: 4.8,
  },
  trenData: [
    { label: '6 Nov', value: 42, kriteriaNonSuspek: 32, suspek: 8, penangananSegera: 2 },
    { label: '7 Nov', value: 48, kriteriaNonSuspek: 37, suspek: 9, penangananSegera: 2 },
    { label: '8 Nov', value: 55, kriteriaNonSuspek: 41, suspek: 11, penangananSegera: 3 },
    { label: '9 Nov', value: 50, kriteriaNonSuspek: 38, suspek: 10, penangananSegera: 2 },
    { label: '10 Nov', value: 63, kriteriaNonSuspek: 47, suspek: 13, penangananSegera: 3 },
    { label: '11 Nov', value: 68, kriteriaNonSuspek: 51, suspek: 14, penangananSegera: 3 },
    { label: '12 Nov', value: 86, kriteriaNonSuspek: 64, suspek: 18, penangananSegera: 4 },
  ],
  gejalaTerbanyak: [
    { nama: 'Demam', iconName: 'demam', count: 1413, percent: 76.7 },
    { nama: 'Batuk', iconName: 'batuk', count: 1264, percent: 68.6 },
    { nama: 'Pilek', iconName: 'pilek', count: 1008, percent: 54.7 },
    { nama: 'Mata Merah', iconName: 'mata', count: 685, percent: 37.2 },
    { nama: 'Ruam Kulit', iconName: 'ruam', count: 600, percent: 32.6 },
  ],
  kategoriRekap: [
    { kategori: 'Belum Memenuhi Kriteria', jumlah: 1387, persentase: 75.3, color: '#10b981' },
    { kategori: 'Mengarah ke Suspek', jumlah: 367, persentase: 19.9, color: '#f59e0b' },
    { kategori: 'Perlu Penanganan Segera', jumlah: 88, persentase: 4.8, color: '#ef4444' },
  ],
  insights: [
    'Total 1.842 skrining dilakukan (↑ 86 dibanding periode sebelumnya).',
    'Sebagian besar hasil (75,3%) belum memenuhi kriteria suspek campak.',
    'Terdapat 88 kasus (4,8%) dengan tanda bahaya yang perlu penanganan segera.',
  ],
}

// Data Laporan Harian (Rekap harian terperinci 7 hari terakhir)
export const HARIAN_DATA: ReportDataSet = {
  periodeLabel: 'Laporan Harian (7 Hari Terakhir)',
  dateRange: '6 Nov 2026 – 12 Nov 2026',
  totalSkrining: 412,
  pertambahan: 28,
  belumMemenuhiKriteria: {
    jumlah: 309,
    persentase: 75.0,
  },
  mengarahSuspek: {
    jumlah: 83,
    persentase: 20.1,
  },
  penangananSegera: {
    jumlah: 20,
    persentase: 4.9,
  },
  trenData: [
    { label: 'Kamis, 6 Nov', value: 42, kriteriaNonSuspek: 32, suspek: 8, penangananSegera: 2 },
    { label: 'Jumat, 7 Nov', value: 48, kriteriaNonSuspek: 37, suspek: 9, penangananSegera: 2 },
    { label: 'Sabtu, 8 Nov', value: 55, kriteriaNonSuspek: 41, suspek: 11, penangananSegera: 3 },
    { label: 'Minggu, 9 Nov', value: 50, kriteriaNonSuspek: 38, suspek: 10, penangananSegera: 2 },
    { label: 'Senin, 10 Nov', value: 63, kriteriaNonSuspek: 47, suspek: 13, penangananSegera: 3 },
    { label: 'Selasa, 11 Nov', value: 68, kriteriaNonSuspek: 51, suspek: 14, penangananSegera: 3 },
    { label: 'Rabu, 12 Nov', value: 86, kriteriaNonSuspek: 64, suspek: 18, penangananSegera: 4 },
  ],
  gejalaTerbanyak: [
    { nama: 'Demam', iconName: 'demam', count: 321, percent: 77.9 },
    { nama: 'Batuk', iconName: 'batuk', count: 280, percent: 68.0 },
    { nama: 'Pilek', iconName: 'pilek', count: 228, percent: 55.3 },
    { nama: 'Mata Merah', iconName: 'mata', count: 156, percent: 37.9 },
    { nama: 'Ruam Kulit', iconName: 'ruam', count: 138, percent: 33.5 },
  ],
  kategoriRekap: [
    { kategori: 'Belum Memenuhi Kriteria', jumlah: 309, persentase: 75.0, color: '#10b981' },
    { kategori: 'Mengarah ke Suspek', jumlah: 83, persentase: 20.1, color: '#f59e0b' },
    { kategori: 'Perlu Penanganan Segera', jumlah: 20, persentase: 4.9, color: '#ef4444' },
  ],
  insights: [
    'Rata-rata 58 skrining dilakukan per hari selama pekan ini.',
    'Puncak skrining terjadi pada hari Rabu (12 Nov) dengan 86 pasien.',
    'Sebanyak 20 pasien dengan tanda bahaya segera dirujuk ke ruang observasi poli.',
  ],
}

// Data Laporan Mingguan (Rekap 4 minggu terakhir)
export const MINGGUAN_DATA: ReportDataSet = {
  periodeLabel: 'Laporan Mingguan (4 Pekan Terakhir)',
  dateRange: '19 Okt 2026 – 12 Nov 2026',
  totalSkrining: 1520,
  pertambahan: 114,
  belumMemenuhiKriteria: {
    jumlah: 1152,
    persentase: 75.8,
  },
  mengarahSuspek: {
    jumlah: 298,
    persentase: 19.6,
  },
  penangananSegera: {
    jumlah: 70,
    persentase: 4.6,
  },
  trenData: [
    { label: 'Minggu 1 (19-25 Okt)', value: 310, kriteriaNonSuspek: 236, suspek: 60, penangananSegera: 14 },
    { label: 'Minggu 2 (26 Okt-1 Nov)', value: 360, kriteriaNonSuspek: 275, suspek: 69, penangananSegera: 16 },
    { label: 'Minggu 3 (2-8 Nov)', value: 438, kriteriaNonSuspek: 332, suspek: 86, penangananSegera: 20 },
    { label: 'Minggu 4 (9-12 Nov)*', value: 412, kriteriaNonSuspek: 309, suspek: 83, penangananSegera: 20 },
  ],
  gejalaTerbanyak: [
    { nama: 'Demam', iconName: 'demam', count: 1162, percent: 76.4 },
    { nama: 'Batuk', iconName: 'batuk', count: 1038, percent: 68.3 },
    { nama: 'Pilek', iconName: 'pilek', count: 832, percent: 54.7 },
    { nama: 'Mata Merah', iconName: 'mata', count: 562, percent: 37.0 },
    { nama: 'Ruam Kulit', iconName: 'ruam', count: 494, percent: 32.5 },
  ],
  kategoriRekap: [
    { kategori: 'Belum Memenuhi Kriteria', jumlah: 1152, persentase: 75.8, color: '#10b981' },
    { kategori: 'Mengarah ke Suspek', jumlah: 298, persentase: 19.6, color: '#f59e0b' },
    { kategori: 'Perlu Penanganan Segera', jumlah: 70, persentase: 4.6, color: '#ef4444' },
  ],
  insights: [
    'Aktivitas skrining meningkat rata-rata 18,2% tiap pekan sejak pekan pertama.',
    'Tren kenaikan konsisten dengan musim peralihan cuaca di wilayah kerja fasyankes.',
    'Distribusi kategori tetap stabil dengan proporsi suspek di bawah 20%.',
  ],
}

// Data Laporan Bulanan (Rekap 6 bulan terakhir)
export const BULANAN_DATA: ReportDataSet = {
  periodeLabel: 'Laporan Bulanan (Semester 2 - 2026)',
  dateRange: 'Juni 2026 – November 2026',
  totalSkrining: 5420,
  pertambahan: 340,
  belumMemenuhiKriteria: {
    jumlah: 4118,
    persentase: 76.0,
  },
  mengarahSuspek: {
    jumlah: 1045,
    persentase: 19.3,
  },
  penangananSegera: {
    jumlah: 257,
    persentase: 4.7,
  },
  trenData: [
    { label: 'Juni', value: 650, kriteriaNonSuspek: 498, suspek: 122, penangananSegera: 30 },
    { label: 'Juli', value: 720, kriteriaNonSuspek: 550, suspek: 138, penangananSegera: 32 },
    { label: 'Agustus', value: 890, kriteriaNonSuspek: 680, suspek: 170, penangananSegera: 40 },
    { label: 'September', value: 980, kriteriaNonSuspek: 745, suspek: 188, penangananSegera: 47 },
    { label: 'Oktober', value: 1140, kriteriaNonSuspek: 865, suspek: 221, penangananSegera: 54 },
    { label: 'Nov (Berjalan)', value: 1040, kriteriaNonSuspek: 780, suspek: 206, penangananSegera: 54 },
  ],
  gejalaTerbanyak: [
    { nama: 'Demam', iconName: 'demam', count: 4140, percent: 76.4 },
    { nama: 'Batuk', iconName: 'batuk', count: 3720, percent: 68.6 },
    { nama: 'Pilek', iconName: 'pilek', count: 2970, percent: 54.8 },
    { nama: 'Mata Merah', iconName: 'mata', count: 2010, percent: 37.1 },
    { nama: 'Ruam Kulit', iconName: 'ruam', count: 1770, percent: 32.7 },
  ],
  kategoriRekap: [
    { kategori: 'Belum Memenuhi Kriteria', jumlah: 4118, persentase: 76.0, color: '#10b981' },
    { kategori: 'Mengarah ke Suspek', jumlah: 1045, persentase: 19.3, color: '#f59e0b' },
    { kategori: 'Perlu Penanganan Segera', jumlah: 257, persentase: 4.7, color: '#ef4444' },
  ],
  insights: [
    'Total 5.420 skrining tercatat sejak implementasi kiosk di fasyankes.',
    'Peningkatan utilisasi kiosk mencapai 75% dari bulan Juni ke Oktober.',
    'Evaluasi sistem pakar dan AI membantu mendeteksi dini 257 kasus tanda bahaya.',
  ],
}

