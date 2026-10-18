// Smoke state + responsif: butuh dev server aktif dan backend hidup.
// Membuktikan state loading/kosong/error tiap halaman data dan bebas overflow
// di pita lebar penuh (360 s.d. 1366px).
// Jalankan: node scripts/smoke-states.mjs http://localhost:5173
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:5173'

function fail(msg) {
  console.error('FAIL:', msg)
  process.exit(1)
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const pageErrors = []

async function newContext() {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('pageerror', (e) => pageErrors.push(String(e)))
  return { ctx, page }
}

async function login(page, nik, password) {
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
  await page.fill('#nik', nik)
  await page.fill('#password', password)
  await page.click('button[type=submit]')
  await page.waitForURL(/\/(beranda|admin)/, { timeout: 15000 })
}

// ---------- 1. Daftar akun kosong (tanpa catatan) untuk state kosong ----------
const reg = await fetch(`${base}/be-api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    NIK: '3201234567890098',
    Name: 'Kosong Kota',
    Tgl_lahir: '1999-01-01',
    Alamat: null,
    id_Role: 'R2',
    password: 'rahasia123',
  }),
})
if (![200, 201, 409].includes(reg.status)) fail(`register akun kosong: HTTP ${reg.status}`)
console.log('PASS akun tanpa catatan siap (atau sudah ada)')

// ---------- 2. State kosong: riwayat + rekaman kamera + beranda admin ----------
{
  const { page } = await newContext()
  await login(page, '3201234567890098', 'rahasia123')
  await page.goto(`${base}/riwayat`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Belum ada riwayat', { timeout: 15000 })
  await page.waitForSelector('text=Belum ada rekaman kamera', { timeout: 15000 })
  console.log('PASS state kosong: riwayat + rekaman kamera')
  await page.goto(`${base}/admin`, { waitUntil: 'networkidle' })
  if (page.url().includes('/admin')) fail('user biasa masuk /admin')
  await page.context().close()
}
{
  const { page } = await newContext()
  await login(page, 'admin', 'admin123')
  // Admin melihat riwayat semua pengguna (kontrak API), jadi /beranda admin
  // menampilkan data selama ada pengguna lain yang mencatat; state kosong
  // HomePage sendiri sudah terbukti lewat akun tanpa catatan di atas.
  await page.goto(`${base}/beranda`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Pemeriksaan terakhir', { timeout: 15000 })
  console.log('PASS beranda admin menampilkan riwayat lintas pengguna (kontrak API)')
  await page.context().close()
}

// ---------- 3. State error + coba lagi (intersepsi jaringan) ----------
{
  const { page } = await newContext()
  await login(page, '3201234567890099', 'rahasia123')

  await page.route('**/be-api/gejala/history*', (route) => route.abort())
  await page.goto(`${base}/beranda`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text=Gagal memuat data', { timeout: 20000 })
  await page.waitForSelector('text=Coba lagi', { timeout: 10000 })
  console.log('PASS state error: beranda (koneksi diputus)')
  await page.unroute('**/be-api/gejala/history*')
  await page.click('text=Coba lagi')
  await page.waitForSelector('text=Pemeriksaan terakhir', { timeout: 15000 })
  await page.waitForSelector('a[href^="/hasil/"]', { timeout: 15000 })
  console.log('PASS pemulihan: coba lagi memuat data')

  // Error di halaman lain: profil
  await page.route('**/be-api/users/me*', (route) => route.abort())
  await page.goto(`${base}/profil`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text=Gagal memuat profil', { timeout: 20000 })
  await page.unroute('**/be-api/users/me*')
  await page.click('text=Coba lagi')
  await page.waitForSelector('text=Uji Coba Web', { timeout: 15000 })
  console.log('PASS state error + pemulihan: profil')

  // 404 detail pemeriksaan (pesan spesifik dari backend)
  await page.goto(`${base}/hasil/id-tidak-ada`, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Data gejala tidak ditemukan', { timeout: 15000 })
  console.log('PASS state error: detail pemeriksaan 404 dengan pesan backend')
  await page.context().close()
}

// ---------- 4. Admin: error ringkasan + skeleton loading ----------
{
  const { page } = await newContext()
  await login(page, 'admin', 'admin123')

  await page.route('**/be-api/users*', (route) => route.abort())
  await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('text=Gagal memuat ringkasan', { timeout: 20000 })
  console.log('PASS state error: ringkasan admin')
  await page.unroute('**/be-api/users*')
  await page.click('text=Coba lagi')
  await page.waitForSelector('text=Pengguna terdaftar', { timeout: 15000 })
  console.log('PASS pemulihan ringkasan admin')

  // Skeleton terlihat saat respons ditunda
  await page.route('**/be-api/users*', async (route) => {
    await new Promise((r) => setTimeout(r, 1200))
    await route.continue()
  })
  await page.goto(`${base}/admin/pengguna`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.skeleton', { timeout: 5000 })
  console.log('PASS state loading: skeleton terlihat sebelum data')
  await page.waitForSelector('text=Administrator', { timeout: 20000 })
  await page.unroute('**/be-api/users*')
  await page.context().close()
}

// ---------- 5. Kamera ditolak / tidak tersedia ----------
{
  const { page } = await newContext()
  await login(page, '3201234567890099', 'rahasia123')

  // Izin ditolak
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: () => Promise.reject(new DOMException('denied', 'NotAllowedError')),
      configurable: true,
    })
  })
  await page.goto(`${base}/periksa`, { waitUntil: 'networkidle' })
  await page.click('text=Aktifkan kamera')
  await page.waitForSelector('text=Izin kamera ditolak', { timeout: 8000 })
  await page.waitForSelector('text=Unggah foto', { timeout: 5000 })
  console.log('PASS kamera ditolak: petunjuk + jalur cadangan tampil')
  await page.context().close()
}
{
  const { page } = await newContext()
  await login(page, '3201234567890099', 'rahasia123')
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: () => Promise.reject(new DOMException('none', 'NotFoundError')),
      configurable: true,
    })
  })
  await page.goto(`${base}/periksa`, { waitUntil: 'networkidle' })
  await page.click('text=Aktifkan kamera')
  await page.waitForSelector('text=Kamera tidak ditemukan', { timeout: 8000 })
  console.log('PASS kamera tidak tersedia: petunjuk tampil')
  await page.context().close()
}

// ---------- 6. Responsif: tanpa overflow halaman di 360/375/600/768/1024/1366 ----------
const WIDTHS = [360, 375, 600, 768, 1024, 1366]
const USER_PAGES = ['/beranda', '/periksa', '/riwayat', '/profil']
const ADMIN_PAGES = ['/admin', '/admin/pengguna', '/admin/pemeriksaan', '/login', '/register']

async function sweep(nik, password, paths) {
  const { ctx, page } = await newContext()
  await login(page, nik, password)
  let failures = 0
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 800 })
    for (const path of paths) {
      await page.goto(`${base}${path}`, { waitUntil: 'networkidle' })
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      if (overflow > 1) {
        console.error(`  overflow ${overflow}px di ${width}px ${path}`)
        failures += 1
      }
    }
  }
  await ctx.close()
  return failures
}

const userFail = await sweep('3201234567890099', 'rahasia123', USER_PAGES)
const adminFail = await sweep('admin', 'admin123', ADMIN_PAGES)
if (userFail || adminFail) fail(`overflow di ${userFail + adminFail} kombinasi lebar/halaman`)
console.log(`PASS responsif: 0 overflow di ${WIDTHS.length} lebar x ${USER_PAGES.length + ADMIN_PAGES.length} halaman`)

if (pageErrors.length) {
  for (const e of pageErrors) console.error(' ', e)
  fail('ada pageerror')
}
console.log('SMOKE STATE + RESPONSIF SELESAI')
await browser.close()
