// Smoke UI: jalankan dengan dev server aktif (npm run dev).
// Contoh: node scripts/smoke-ui.mjs http://localhost:5173
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:5173'

function fail(msg) {
  console.error('FAIL:', msg)
  process.exit(1)
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const errors = []

async function newPage(viewport) {
  const page = await browser.newPage({ viewport })
  page.on('console', (m) => {
    // 401/403 dari uji negatif (login salah, guard role) adalah bagian skenario,
    // bukan kegagalan halaman; yang dicatat hanya error lain.
    if (m.type() === 'error' && !/40[13]/.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
  return page
}

// 1. Halaman awal publik
let page = await newPage({ width: 1280, height: 900 })
await page.goto(`${base}/`, { waitUntil: 'networkidle' })
if (!(await page.title()).includes('MeaslesCare')) fail('judul halaman tidak sesuai')
const h1 = await page.locator('h1').first().textContent()
if (!h1?.toLowerCase().includes('campak')) fail(`h1 tak terduga: ${h1}`)
console.log('PASS halaman awal terbuka:', h1?.trim())

// 2. Login salah: pesan error tampil
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.fill('#nik', '9999')
await page.fill('#password', 'salah')
await page.click('button[type=submit]')
await page.waitForSelector('[role=alert]', { timeout: 8000 })
console.log('PASS login salah menampilkan pesan')

// 3. Login benar sebagai user: masuk ke /beranda
await page.fill('#nik', '3201234567890099')
await page.fill('#password', 'rahasia123')
await page.click('button[type=submit]')
await page.waitForURL('**/beranda', { timeout: 10000 })
console.log('PASS login user -> /beranda')

// 4. Isi pemeriksaan: suhu di luar rentang ditolak klien
await page.goto(`${base}/periksa`, { waitUntil: 'networkidle' })
await page.fill('#suhu', '90')
await page.click('button[type=submit]')
const suhuErr = await page.locator('text=Suhu harus antara 30 dan 45').count()
if (suhuErr < 1) fail('validasi suhu tidak muncul')
console.log('PASS validasi suhu di luar rentang ditolak')

// 5. Simpan pemeriksaan valid -> halaman hasil
await page.fill('#suhu', '38,4')
await page.selectOption('#batuk', 'kering')
await page.click('button[type=submit]')
await page.waitForURL('**/hasil/**', { timeout: 15000 })
await page.waitForSelector('text=Data gejala', { timeout: 10000 })
const suhuTampil = await page.locator('text=38,4').count()
if (suhuTampil < 1) fail('suhu tidak tampil di hasil')
console.log('PASS simpan pemeriksaan -> halaman hasil dengan data')

// 6. Rekam deteksi kamera dari halaman hasil
await page.fill('#camera-status', 'normal')
await page.click('text=Rekam deteksi')
await page.waitForSelector('text=Kamera: normal', { timeout: 10000 })
console.log('PASS rekam deteksi kamera tampil sebagai badge')

// 7. Riwayat memuat catatan; profil memuat nama
await page.goto(`${base}/riwayat`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Pemeriksaan', { timeout: 10000 })
console.log('PASS riwayat menampilkan catatan')
await page.goto(`${base}/profil`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Uji Coba Web', { timeout: 10000 })
console.log('PASS profil menampilkan data user')

// 8. User biasa ditolak di /admin (redirect ke /beranda)
await page.goto(`${base}/admin`, { waitUntil: 'networkidle' })
if (!page.url().includes('/beranda')) fail(`user biasa tidak dialihkan dari /admin (url: ${page.url()})`)
console.log('PASS guard role: user biasa dialihkan dari /admin')

// 9. Mobile viewport: nav bawah tampil, tanpa overflow horizontal
const mob = await newPage({ width: 375, height: 720 })
await mob.goto(`${base}/login`, { waitUntil: 'networkidle' })
const overflow = await mob.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
if (overflow > 1) fail(`overflow horizontal ${overflow}px di 375px`)
console.log('PASS mobile 375px tanpa overflow horizontal')

// 10. Logout
await page.goto(`${base}/beranda`, { waitUntil: 'networkidle' })
await page.click('text=Keluar')
await page.waitForURL('**/login', { timeout: 8000 })
console.log('PASS logout -> /login')

if (errors.length) {
  console.error('Ada error konsol:')
  for (const e of errors) console.error(' ', e)
  fail('konsol tidak bersih')
}
console.log('SMOKE UI SELESAI, konsol bersih')
await browser.close()
