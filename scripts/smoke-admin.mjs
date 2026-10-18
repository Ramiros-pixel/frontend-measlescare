// Smoke UI alur admin: login admin, ringkasan, pengguna, detail, pemeriksaan.
// Jalankan dengan dev server aktif: node scripts/smoke-admin.mjs http://localhost:5173
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:5173'

function fail(msg) {
  console.error('FAIL:', msg)
  process.exit(1)
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const errors = []
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('console', (m) => {
  if (m.type() === 'error' && !/40[13]/.test(m.text())) errors.push(`console: ${m.text()}`)
})
page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))

// Login admin -> diarahkan ke /admin
await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
await page.fill('#nik', 'admin')
await page.fill('#password', 'admin123')
await page.click('button[type=submit]')
await page.waitForURL('**/admin', { timeout: 10000 })
console.log('PASS login admin -> /admin')

// Ringkasan: angka dari API tampil
await page.waitForSelector('text=Pengguna terdaftar', { timeout: 20000 })
await page.waitForSelector('text=Uji Coba Web', { timeout: 10000 })
console.log('PASS ringkasan memuat angka dan pemeriksaan terbaru')

// Daftar pengguna: 2 akun, lalu filter menyaring ke satu akun
await page.goto(`${base}/admin/pengguna`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Administrator', { timeout: 20000 })
await page.fill('#cari-user', '3201234567890099')
await page.waitForSelector('text=Uji Coba Web', { timeout: 20000 })
const sisaAdmin = await page.locator('a:has-text("Administrator")').count()
if (sisaAdmin > 0) fail('filter NIK tidak menyaring daftar')
console.log('PASS daftar pengguna + filter teks menyaring')

// Detail pengguna: data profil + riwayatnya
await page.goto(`${base}/admin/pengguna/3201234567890099`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Uji Coba Web', { timeout: 20000 })
await page.waitForSelector('text=Riwayat pemeriksaan pengguna ini', { timeout: 20000 })
console.log('PASS detail pengguna + riwayat')

// Tabel pemeriksaan: baris dan kolom kunci
await page.goto(`${base}/admin/pemeriksaan`, { waitUntil: 'networkidle' })
await page.waitForSelector('th >> text=NIK', { timeout: 20000 })
const baris = await page.locator('tbody tr').count()
if (baris < 1) fail('tabel pemeriksaan kosong padahal ada data')
// Detail via klik
await page.click('tbody tr:first-child >> text=Detail')
await page.waitForURL('**/admin/pemeriksaan/**', { timeout: 10000 })
await page.waitForSelector('text=Data gejala', { timeout: 20000 })
console.log('PASS tabel pemeriksaan -> detail')

// Guard: admin tetap boleh ke area user
await page.goto(`${base}/beranda`, { waitUntil: 'networkidle' })
await page.waitForSelector('text=Halo, Administrator', { timeout: 20000 })
console.log('PASS admin membuka area pengguna')

if (errors.length) {
  console.error('Ada error konsol:')
  for (const e of errors) console.error(' ', e)
  fail('konsol tidak bersih')
}
console.log('SMOKE ADMIN SELESAI, konsol bersih')
await browser.close()
