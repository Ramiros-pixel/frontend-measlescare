import type { RfidRecord } from './types'

export interface PatientScreeningHistory {
  id: string
  waktu: string
  suhu: number
  hasil: 'Belum Memenuhi Kriteria' | 'Mengarah ke Suspek' | 'Perlu Penanganan Segera'
}

export interface PatientItem {
  id: string
  idPasien: string
  nama: string
  usia: string
  umurTahun: number
  tanggalLahir: string
  jenisKelamin: 'Laki-laki' | 'Perempuan'
  nik: string
  uidRfid: string | null
  alamat: string
  noTelepon: string
  terakhirSkrining: string | null
  status: 'Aktif' | 'Nonaktif'
  riwayatSkrining: PatientScreeningHistory[]
}

// Data dummy realistis persis seperti di gambar referensi
export const INITIAL_PATIENTS: PatientItem[] = [
  {
    id: '1',
    idPasien: 'P-03174',
    nama: 'Aisyah Putri',
    usia: '7 th',
    umurTahun: 7,
    tanggalLahir: '12 Mar 2019',
    jenisKelamin: 'Perempuan',
    nik: '3201014502120002',
    uidRfid: 'RFID-8F3A2C1D',
    alamat: 'Jl. Sukaraja No. 24, Bandung',
    noTelepon: '0812-3456-7890',
    terakhirSkrining: '12 Nov 2026, 14:28',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-01', waktu: '12 Nov 2026, 14:28', suhu: 38.5, hasil: 'Perlu Penanganan Segera' },
      { id: 'S-01b', waktu: '28 Okt 2026, 09:15', suhu: 37.8, hasil: 'Mengarah ke Suspek' },
      { id: 'S-01c', waktu: '15 Sep 2026, 11:30', suhu: 36.8, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '2',
    idPasien: 'P-03173',
    nama: 'Rizky Pratama',
    usia: '8 th',
    umurTahun: 8,
    tanggalLahir: '05 Jun 2018',
    jenisKelamin: 'Laki-laki',
    nik: '3201021406150001',
    uidRfid: 'RFID-1B9D4E7F',
    alamat: 'Jl. Melati No. 12, Bandung',
    noTelepon: '0813-9988-7766',
    terakhirSkrining: '12 Nov 2026, 14:10',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-02', waktu: '12 Nov 2026, 14:10', suhu: 37.8, hasil: 'Mengarah ke Suspek' },
      { id: 'S-02b', waktu: '10 Okt 2026, 10:20', suhu: 36.7, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '3',
    idPasien: 'P-03172',
    nama: 'Salsabila Rahma',
    usia: '6 th',
    umurTahun: 6,
    tanggalLahir: '18 Sep 2020',
    jenisKelamin: 'Perempuan',
    nik: '3201036209140003',
    uidRfid: 'RFID-3C7E9A21',
    alamat: 'Jl. Cihampelas No. 88, Bandung',
    noTelepon: '0857-1122-3344',
    terakhirSkrining: '12 Nov 2026, 13:57',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-03', waktu: '12 Nov 2026, 13:57', suhu: 36.9, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '4',
    idPasien: 'P-03171',
    nama: 'Bima Aditya',
    usia: '7 th',
    umurTahun: 7,
    tanggalLahir: '22 Jan 2019',
    jenisKelamin: 'Laki-laki',
    nik: '3201042805160002',
    uidRfid: 'RFID-6D2F8B34',
    alamat: 'Komplek Permata Blok B-4, Bandung',
    noTelepon: '0821-4455-6677',
    terakhirSkrining: '12 Nov 2026, 13:34',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-04', waktu: '12 Nov 2026, 13:34', suhu: 37.6, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '5',
    idPasien: 'P-03170',
    nama: 'Naila Safitri',
    usia: '8 th',
    umurTahun: 8,
    tanggalLahir: '09 Agu 2018',
    jenisKelamin: 'Perempuan',
    nik: '3201055503170004',
    uidRfid: 'RFID-9A4B1C6E',
    alamat: 'Jl. Riau No. 45, Bandung',
    noTelepon: '0878-5566-7788',
    terakhirSkrining: '12 Nov 2026, 13:20',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-05', waktu: '12 Nov 2026, 13:20', suhu: 38.1, hasil: 'Mengarah ke Suspek' },
    ],
  },
  {
    id: '6',
    idPasien: 'P-03169',
    nama: 'Farhan Maulana',
    usia: '5 th',
    umurTahun: 5,
    tanggalLahir: '14 Nov 2021',
    jenisKelamin: 'Laki-laki',
    nik: '3201061908150001',
    uidRfid: null,
    alamat: 'Jl. Pasirkaliki No. 102, Bandung',
    noTelepon: '0819-3322-1100',
    terakhirSkrining: null,
    status: 'Aktif',
    riwayatSkrining: [],
  },
  {
    id: '7',
    idPasien: 'P-03168',
    nama: 'Putri Anindita',
    usia: '6 th',
    umurTahun: 6,
    tanggalLahir: '03 Feb 2020',
    jenisKelamin: 'Perempuan',
    nik: '3201075010130005',
    uidRfid: 'RFID-7E5D3A90',
    alamat: 'Jl. Dago Asri No. 17, Bandung',
    noTelepon: '0852-6677-8899',
    terakhirSkrining: '11 Nov 2026, 16:45',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-07', waktu: '11 Nov 2026, 16:45', suhu: 38.4, hasil: 'Perlu Penanganan Segera' },
    ],
  },
  {
    id: '8',
    idPasien: 'P-03167',
    nama: 'Daffa Alghifari',
    usia: '6 th',
    umurTahun: 6,
    tanggalLahir: '29 Des 2019',
    jenisKelamin: 'Laki-laki',
    nik: '3201081107140003',
    uidRfid: null,
    alamat: 'Jl. Antapani No. 59, Bandung',
    noTelepon: '0812-7788-9900',
    terakhirSkrining: null,
    status: 'Nonaktif',
    riwayatSkrining: [],
  },
  {
    id: '9',
    idPasien: 'P-03166',
    nama: 'Keisya Amara',
    usia: '7 th',
    umurTahun: 7,
    tanggalLahir: '11 Jul 2019',
    jenisKelamin: 'Perempuan',
    nik: '3201094312150002',
    uidRfid: 'RFID-4F8B2D19',
    alamat: 'Jl. Setiabudi No. 201, Bandung',
    noTelepon: '0813-2233-4455',
    terakhirSkrining: '11 Nov 2026, 11:30',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-09', waktu: '11 Nov 2026, 11:30', suhu: 37.9, hasil: 'Mengarah ke Suspek' },
    ],
  },
  {
    id: '10',
    idPasien: 'P-03165',
    nama: 'Rafli Hermawan',
    usia: '8 th',
    umurTahun: 8,
    tanggalLahir: '04 Mei 2018',
    jenisKelamin: 'Laki-laki',
    nik: '3201100504160001',
    uidRfid: 'RFID-2E6C9A43',
    alamat: 'Jl. Buahbatu No. 14, Bandung',
    noTelepon: '0877-3344-5566',
    terakhirSkrining: '11 Nov 2026, 11:08',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-10', waktu: '11 Nov 2026, 11:08', suhu: 36.8, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '11',
    idPasien: 'P-03164',
    nama: 'Zahra Maulida',
    usia: '9 th',
    umurTahun: 9,
    tanggalLahir: '19 Okt 2017',
    jenisKelamin: 'Perempuan',
    nik: '3201115809140004',
    uidRfid: 'RFID-5B1D8F72',
    alamat: 'Jl. Soekarno Hatta No. 340, Bandung',
    noTelepon: '0896-1122-4455',
    terakhirSkrining: '10 Nov 2026, 16:45',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-11', waktu: '10 Nov 2026, 16:45', suhu: 38.6, hasil: 'Perlu Penanganan Segera' },
    ],
  },
  {
    id: '12',
    idPasien: 'P-03163',
    nama: 'Arkan Danendra',
    usia: '6 th',
    umurTahun: 6,
    tanggalLahir: '25 Jan 2020',
    jenisKelamin: 'Laki-laki',
    nik: '3201121001150002',
    uidRfid: 'RFID-8A3F1C90',
    alamat: 'Jl. Kopo No. 78, Bandung',
    noTelepon: '0812-9900-1122',
    terakhirSkrining: '10 Nov 2026, 15:20',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-12', waktu: '10 Nov 2026, 15:20', suhu: 37.7, hasil: 'Mengarah ke Suspek' },
    ],
  },
  {
    id: '13',
    idPasien: 'P-03162',
    nama: 'Tiara Andini',
    usia: '7 th',
    umurTahun: 7,
    tanggalLahir: '16 Mar 2019',
    jenisKelamin: 'Perempuan',
    nik: '3201016503150006',
    uidRfid: null,
    alamat: 'Jl. Cibaduyut No. 89, Bandung',
    noTelepon: '0856-3344-5566',
    terakhirSkrining: '09 Nov 2026, 10:15',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-13', waktu: '09 Nov 2026, 10:15', suhu: 36.7, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '14',
    idPasien: 'P-03161',
    nama: 'Dimas Setiawan',
    usia: '8 th',
    umurTahun: 8,
    tanggalLahir: '07 Nov 2018',
    jenisKelamin: 'Laki-laki',
    nik: '3201022204130003',
    uidRfid: 'RFID-7D4E1B99',
    alamat: 'Jl. Gatot Subroto No. 112, Bandung',
    noTelepon: '0818-7766-5544',
    terakhirSkrining: '08 Nov 2026, 14:00',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-14', waktu: '08 Nov 2026, 14:00', suhu: 38.2, hasil: 'Mengarah ke Suspek' },
    ],
  },
  {
    id: '15',
    idPasien: 'P-03160',
    nama: 'Clara Oktaviani',
    usia: '6 th',
    umurTahun: 6,
    tanggalLahir: '14 Des 2019',
    jenisKelamin: 'Perempuan',
    nik: '3201037010160001',
    uidRfid: 'RFID-3A9B6C22',
    alamat: 'Jl. Surya Sumantri No. 51, Bandung',
    noTelepon: '0822-4455-8899',
    terakhirSkrining: '08 Nov 2026, 09:30',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-15', waktu: '08 Nov 2026, 09:30', suhu: 36.9, hasil: 'Belum Memenuhi Kriteria' },
    ],
  },
  {
    id: '16',
    idPasien: 'P-03159',
    nama: 'Kenzo Alvaro',
    usia: '7 th',
    umurTahun: 7,
    tanggalLahir: '21 Agu 2019',
    jenisKelamin: 'Laki-laki',
    nik: '3201041508150005',
    uidRfid: 'RFID-6F2E8A11',
    alamat: 'Jl. Pasteur No. 33, Bandung',
    noTelepon: '0811-2244-6688',
    terakhirSkrining: '05 Nov 2026, 11:15',
    status: 'Aktif',
    riwayatSkrining: [
      { id: 'S-16', waktu: '05 Nov 2026, 11:15', suhu: 38.8, hasil: 'Perlu Penanganan Segera' },
    ],
  },
]

/* UID RFID simulasi untuk sebagian NIK. */
const DAFTAR_UID: Record<string, string> = {
  '3201234567890099': 'RFID-8F3A2C1D',
  admin: 'RFID-11B7D4E2',
}

const DAFTAR_BULAN_INI: string[] = ['3201234567890099']

export function uidUntukNik(nik: string): RfidRecord {
  const uid = DAFTAR_UID[nik]
  return {
    nik,
    uid_rfid: uid ?? '-',
    status_terdaftar: Boolean(uid),
  }
}

export function daftarRfid(niks: string[]): RfidRecord[] {
  return niks.map(uidUntukNik)
}

export function terdaftarBulanIni(nik: string): boolean {
  return DAFTAR_BULAN_INI.includes(nik)
}

export function hitungPasienBaruBulanIni(niks: string[]): number {
  return niks.filter((nik) => terdaftarBulanIni(nik)).length
}
