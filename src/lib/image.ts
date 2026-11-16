/**
 * Utilitas konversi dan validasi citra untuk MeaslesWatch AI.
 * Huawei ICT Competition 2026–2027 | Innovation Track
 * Team: Inovexa
 */

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number]

// Batas maksimum ukuran citra: 5 MB (selaras dengan batas upload PhotoPicker frontend)
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

// Panjang karakter Base64 teoritis maksimum untuk 5 MB (tanpa alokasi memori berlebih)
const MAX_BASE64_CHARS = Math.ceil(MAX_IMAGE_SIZE_BYTES / 3) * 4

/**
 * Memvalidasi apakah string payload memenuhi spesifikasi format Base64 RFC 4648
 * secara efisien tanpa regex rekursif untuk mencegah call stack overflow pada berkas besar.
 */
function isValidBase64(payload: string): boolean {
  if (payload.length === 0 || payload.length % 4 !== 0) {
    return false
  }

  // Karakter hanya boleh berisi alfabet Base64 dan tanda padding '='
  if (!/^[A-Za-z0-9+/=]+$/.test(payload)) {
    return false
  }

  // Validasi posisi dan jumlah padding '='
  const firstEq = payload.indexOf('=')
  if (firstEq !== -1) {
    // Tanda '=' hanya boleh berada pada indeks (panjang - 1) atau (panjang - 2)
    if (firstEq < payload.length - 2) {
      return false
    }
    // Jika tanda '=' dimulai pada (panjang - 2), maka karakter terakhir wajib berupa '='
    if (firstEq === payload.length - 2 && payload[payload.length - 1] !== '=') {
      return false
    }
  }

  return true
}

/**
 * Mengonversi Data URL (misal hasil jepretan kamera canvas.toDataURL('image/jpeg', 0.85))
 * menjadi objek binary Blob yang siap dikirim ke API inferensi MeaslesWatch AI.
 *
 * @param dataUrl - String Data URL gambar berformat Base64 (contoh: "data:image/jpeg;base64,...")
 * @returns Blob biner dengan MIME type yang sesuai
 * @throws {TypeError} Jika dataUrl bukan string
 * @throws {Error} Jika format Data URL, MIME type, atau payload Base64 tidak valid
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  // 1. Validasi tipe data input
  if (typeof dataUrl !== 'string') {
    throw new TypeError('Input Data URL harus berupa string.')
  }

  const trimmed = dataUrl.trim()
  if (!trimmed) {
    throw new Error('Data URL tidak boleh kosong.')
  }

  // 2. Validasi awalan skema data:
  if (!trimmed.startsWith('data:')) {
    throw new Error('Format Data URL tidak valid: harus diawali dengan "data:".')
  }

  // 3. Cari pemisah koma antara metadata header dan payload data
  const commaIndex = trimmed.indexOf(',')
  if (commaIndex === -1) {
    throw new Error('Format Data URL tidak valid: tidak ditemukan pemisah tanda koma (,).')
  }

  const header = trimmed.slice(5, commaIndex) // potong awalan 'data:'
  const rawPayload = trimmed.slice(commaIndex + 1)

  // 4. Validasi penanda pengodean Base64
  if (!header.endsWith(';base64')) {
    throw new Error('Data URL harus menggunakan pengodean Base64 (;base64).')
  }

  // 5. Ekstraksi dan validasi MIME type
  const rawMime = header.slice(0, -7).trim().toLowerCase()
  const mimeType = rawMime.split(';')[0].trim()

  if (!mimeType) {
    throw new Error('Tipe MIME tidak ditemukan pada header Data URL.')
  }

  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType as SupportedImageMimeType)) {
    throw new Error(
      `Tipe MIME "${mimeType}" tidak didukung. Format citra yang diizinkan: ${SUPPORTED_IMAGE_MIME_TYPES.join(', ')}.`
    )
  }

  // 6. Validasi ketersediaan payload
  if (!rawPayload) {
    throw new Error('Payload Base64 pada Data URL kosong.')
  }

  // 7. Pengaman awal batas ukuran berkas berdasarkan panjang string Base64
  if (rawPayload.length > MAX_BASE64_CHARS) {
    throw new Error('Ukuran citra melebihi batas maksimum 5 MB.')
  }

  // 8. Validasi kepatuhan format Base64 dan padding
  if (!isValidBase64(rawPayload)) {
    throw new Error('Format payload Base64 tidak valid atau memiliki karakter/padding yang rusak.')
  }

  // 9. Dekode Base64 secara aman
  let binaryString: string
  try {
    binaryString = atob(rawPayload)
  } catch (err) {
    throw new Error(
      `Gagal mendekode payload Base64: ${err instanceof Error ? err.message : String(err)}`
    )
  }

  const byteLength = binaryString.length
  if (byteLength === 0) {
    throw new Error('Payload citra kosong (0 byte).')
  }

  // 10. Validasi batas ukuran maksimum byte aktual (5 MB)
  if (byteLength > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(
      `Ukuran citra (${(byteLength / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimum 5 MB.`
    )
  }

  // 11. Konversi string biner ke Uint8Array dan bungkus ke dalam Blob
  const bytes = new Uint8Array(byteLength)
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return new Blob([bytes], { type: mimeType })
}
