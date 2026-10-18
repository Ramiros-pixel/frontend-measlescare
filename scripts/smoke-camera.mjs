// Smoke alur kamera: butuh flag fake media device, jadi terpisah dari smoke-ui.
// Jalankan dengan dev server aktif: node scripts/smoke-camera.mjs http://localhost:5173
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:5173'

function fail(msg) {
  console.error('FAIL:', msg)
  process.exit(1)
}

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
})
const errors = []
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))

await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.fill('#nik', '3201234567890099')
await page.fill('#password', 'rahasia123')
await page.click('button[type=submit]')
await page.waitForURL('**/beranda', { timeout: 15000 })
await page.goto(`${base}/periksa`, { waitUntil: 'networkidle' })

// Aktifkan kamera -> pratinjau hidup
await page.click('text=Aktifkan kamera')
await page.waitForSelector('video[aria-label="Pratinjau kamera"]:visible', { timeout: 10000 })
await page.waitForSelector('text=Ambil gambar', { timeout: 10000 })
const live = await page.evaluate(() => {
  const v = document.querySelector('video')
  return v.readyState >= 2 && v.videoWidth > 0
})
if (!live) fail('video tidak menerima stream')
console.log('PASS pratinjau kamera hidup')

// Ambil gambar -> muncul bagian gambar yang dianalisis
await page.click('text=Ambil gambar')
await page.waitForSelector('text=Gambar yang dianalisis', { timeout: 5000 })
const src = await page.getAttribute('img[alt="Foto yang dianalisis"]', 'src')
if (!src?.startsWith('data:image/jpeg')) fail('hasil snap bukan JPEG data URL')
console.log('PASS ambil gambar menghasilkan foto')

// Ganti kamera tetap hidup
await page.click('text=Ganti kamera')
await page.waitForSelector('text=Ambil gambar', { timeout: 10000 })
const stillLive = await page.evaluate(() => {
  const v = document.querySelector('video')
  return v.readyState >= 2 && !v.paused
})
if (!stillLive) fail('kamera mati setelah ganti kamera')
console.log('PASS ganti kamera depan/belakang')

// Matikan kamera -> kembali ke tombol aktifkan
await page.click('text=Matikan kamera')
await page.waitForSelector('text=Aktifkan kamera', { timeout: 5000 })
console.log('PASS matikan kamera')

// Fallback unggah file
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
await page.setInputFiles('input[type=file]', { name: 'tes.png', mimeType: 'image/png', buffer: png })
await page.waitForSelector('text=Gambar yang dianalisis', { timeout: 5000 })
console.log('PASS unggah foto sebagai cadangan')

// Ambil ulang menghapus foto
await page.click('text=Ambil ulang')
const sisa = await page.locator('text=Gambar yang dianalisis').count()
if (sisa !== 0) fail('ambil ulang tidak menghapus foto')
console.log('PASS ambil ulang')

// Simpan pemeriksaan tetap jalan setelah seluruh interaksi kamera
await page.fill('#suhu', '37,2')
await page.click('button[type=submit]')
await page.waitForURL('**/hasil/**', { timeout: 15000 })
console.log('PASS simpan pemeriksaan setelah alur kamera')

if (errors.length) {
  for (const e of errors) console.error(' ', e)
  fail('ada pageerror')
}
console.log('SMOKE KAMERA SELESAI')
await browser.close()
