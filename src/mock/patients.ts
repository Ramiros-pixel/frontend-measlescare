/*
 * Data pasien simulasi yang tidak tersedia di backend.
 *
 * Backend hanya menyediakan /users (NIK, Nama, Tgl_lahir, Alamat, role).
 * Dua hal berikut belum ada di backend dan karena itu ditandai simulasi:
 *   1. UID RFID yang terdaftar pada tiap pasien.
 *   2. Status pendaftaran bulan berjalan (backend tidak menyimpan tanggal
 *      pendaftaran akun).
 *
 * Kedua data ini disusun sebagai daftar NIK, sehingga angkanya selalu
 * dihitung dari daftar pasien nyata yang dimuat dari API /users: bagian
 * yang tidak ada di daftar mock otomatis berstatus "belum terdaftar".
 */

import type { RfidRecord } from './types'

/* UID RFID simulasi untuk sebagian NIK. */
const DAFTAR_UID: Record<string, string> = {
  '3201234567890099': 'RFID-8F3A2C1D',
  admin: 'RFID-11B7D4E2',
}

/* NIK yang dianggap terdaftar pada bulan berjalan (status simulasi). */
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

/* True bila NIK ada di daftar pendaftaran bulan berjalan (simulasi). */
export function terdaftarBulanIni(nik: string): boolean {
  return DAFTAR_BULAN_INI.includes(nik)
}

/*
 * Jumlah pasien baru bulan ini dihitung dari daftar pasien nyata: hanya
 * NIK yang ada di DAFTAR_BULAN_INI yang dihitung, sehingga angka ini tidak
 * pernah melebihi total pasien.
 */
export function hitungPasienBaruBulanIni(niks: string[]): number {
  return niks.filter((nik) => terdaftarBulanIni(nik)).length
}
