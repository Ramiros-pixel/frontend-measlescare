import { Suspense, lazy, useRef } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'

// three.js hanya dimuat saat halaman landing dibuka, bukan di bundle utama.
const KioskScene = lazy(() => import('@/components/kiosk/KioskScene'))

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

interface FiturKios {
  judul: string
  deskripsi: string
  icon: ReactNode
}

const FITUR_KIOS: FiturKios[] = [
  {
    judul: 'Layar sentuh 7 inci',
    deskripsi:
      'Petunjuk pengisian ditampilkan langsung di badan alat: nama, usia, gejala yang dirasakan, dan riwayat kontak dengan penderita campak.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6" aria-hidden>
        <rect x="6" y="3" width="12" height="15" rx="2" />
        <path d="M9 21h6M12 18v3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    judul: 'Kamera ESP32-CAM',
    deskripsi:
      'Kios mengambil foto lewat kamera di bagian kepala alat. Foto menjadi bahan pemeriksaan lanjutan oleh tenaga kesehatan.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6" aria-hidden>
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.2-1.8h5.4L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
        <circle cx="12" cy="12.5" r="3.2" />
      </svg>
    ),
  },
  {
    judul: 'Sensor suhu MLX90614',
    deskripsi:
      'Suhu tubuh diukur tanpa sentuh dari jarak panduan yang tertulis di alat, sehingga skrining tetap higienis.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6" aria-hidden>
        <path d="M10 4a2 2 0 1 1 4 0v8.35a4 4 0 1 1-4 0V4Z" />
        <circle cx="12" cy="16" r="1.6" />
      </svg>
    ),
  },
  {
    judul: 'Riwayat tersimpan',
    deskripsi:
      'Setiap skrining tercatat sebagai riwayat yang bisa dibuka kembali kapan saja, lengkap dengan hasil deteksi kamera.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6" aria-hidden>
        <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-13Z" />
        <path d="M8 8.5h8M8 12h8M8 15.5h5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const LANGKAH: { judul: string; deskripsi: string }[] = [
  {
    judul: 'Buat akun MeaslesCare',
    deskripsi: 'Daftar sekali, lalu data pemeriksaan Anda tersimpan rapi pada akun tersebut.',
  },
  {
    judul: 'Datang ke kios skrining',
    deskripsi: 'Ikuti petunjuk di layar sentuh: isi gejala, berdiri di posisi panduan, biarkan alat bekerja.',
  },
  {
    judul: 'Pantau hasil dan riwayat',
    deskripsi: 'Hasil skrining muncul di aplikasi Anda dan membantu deteksi dini campak sejak gejala awal.',
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const alatRef = useRef<HTMLElement | null>(null)

  if (loading) return null
  if (user) {
    return <Navigate to={user.id_Role === 'R1' ? '/admin' : '/beranda'} replace />
  }

  return (
    <div className="min-h-dvh bg-surface-muted">
      {/* ============ Hero dengan background gambar ============ */}
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-center md:bg-[position:center_top] md:bg-fixed"
          style={{ backgroundImage: "url('/images/landing-hero.jpg')" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-surface from-20% via-surface/80 via-50% to-surface/40 md:to-surface/5"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-16 bg-gradient-to-b from-transparent to-surface-muted"
        />

        <header className="flex items-center justify-between px-5 py-4 sm:px-10">
          <span className="text-base font-bold text-primary">MeaslesCare</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => (window.location.href = '/login')}>
              Masuk
            </Button>
            <Button onClick={() => (window.location.href = '/register')}>Daftar akun</Button>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-10 pt-10 sm:px-10 sm:pt-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Kios skrining campak
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-text sm:text-5xl sm:leading-[1.15]">
              Deteksi dini campak, langsung di tempat umum.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
              MeaslesCare menghadirkan kios skrining berbasis kamera ESP32-CAM dan sensor suhu
              infrared: catat gejala, ambil foto lewat kamera, dan simpan riwayatnya agar gejala
              campak terdeteksi lebih awal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => (window.location.href = '/register')}>
                Buat akun sekarang
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => scrollToId('tentang-alat')}
              >
                Lihat alatnya
              </Button>
            </div>
          </div>

          {/* Ringkasan singkat di atas background */}
          <dl className="mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-soft bg-surface/90 p-4">
              <dt className="text-sm font-semibold text-text">Tanpa sentuh</dt>
              <dd className="mt-1 text-sm text-muted">Suhu diukur sensor infrared MLX90614.</dd>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface/90 p-4">
              <dt className="text-sm font-semibold text-text">Kamera otomatis</dt>
              <dd className="mt-1 text-sm text-muted">Foto diambil modul ESP32-CAM.</dd>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface/90 p-4">
              <dt className="text-sm font-semibold text-text">Riwayat pribadi</dt>
              <dd className="mt-1 text-sm text-muted">Hanya Anda dan admin yang bisa membukanya.</dd>
            </div>
          </dl>
        </main>
      </div>

      {/* ============ Tentang alat: display 3D mengikuti scroll ============ */}
      <section
        id="tentang-alat"
        ref={alatRef}
        className="mx-auto w-full max-w-6xl scroll-mt-4 px-5 sm:px-10"
      >
        <div className="grid gap-8 py-14 lg:grid-cols-2 lg:gap-12">
          {/* Panel 3D: sticky di desktop, blok tinggi di ponsel */}
          <div className="relative h-[440px] overflow-hidden rounded-lg border border-border-soft bg-surface-muted shadow-sm sm:h-[520px] lg:sticky lg:top-0 lg:h-dvh lg:rounded-none lg:border-0 lg:shadow-none">
            <Suspense fallback={<div role="status" aria-label="Memuat model 3D" className="spinner absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2" />}>
              <KioskScene sectionRef={alatRef} />
            </Suspense>
          </div>

          {/* Penjelasan alat */}
          <div className="flex flex-col justify-center py-2 lg:py-28">
            <h2 className="text-2xl font-bold text-text sm:text-3xl">
              Mengenal alat skrining MeaslesCare
            </h2>
            <p className="mt-4 text-base text-muted">
              Alat ini dirancang untuk mempermudah deteksi dini campak di tempat umum seperti
              bandara, sekolah, dan puskesmas. Pengunjung tidak perlu antre di loket: cukup berdiri
              di depan kios dan mengikuti petunjuk di layar.
            </p>

            <ul className="mt-8 flex flex-col gap-4 lg:gap-6">
              {FITUR_KIOS.map((f) => (
                <li
                  key={f.judul}
                  className="flex gap-4 rounded-lg border border-border-soft bg-surface p-4 lg:p-5"
                >
                  <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    {f.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-text">{f.judul}</h3>
                    <p className="mt-1 text-sm text-muted">{f.deskripsi}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ Cara pakai ============ */}
      <section className="border-t border-border-soft bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-10">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Cara menggunakan layanan ini</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {LANGKAH.map((l, i) => (
              <li key={l.judul} className="rounded-lg border border-border-soft bg-surface-muted p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-text">{l.judul}</h3>
                <p className="mt-1 text-sm text-muted">{l.deskripsi}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ CTA akhir ============ */}
      <section className="bg-primary-soft">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h2 className="text-xl font-bold text-text sm:text-2xl">
              Siap mencoba skrining di kios MeaslesCare?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Buat akun terlebih dahulu agar hasil skrining dan riwayat kesehatan Anda tersimpan.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button size="lg" onClick={() => (window.location.href = '/register')}>
              Daftar akun
            </Button>
            <Button size="lg" variant="secondary" onClick={() => (window.location.href = '/login')}>
              Masuk
            </Button>
          </div>
        </div>
      </section>

      {/* ============ Footer ============ */}
      <footer className="border-t border-border-soft bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-10">
          <p className="text-sm font-bold text-primary">MeaslesCare</p>
          <p className="mt-2 max-w-2xl text-xs text-muted">
            MeaslesCare membantu pencatatan dan deteksi dini. Hasil bukan diagnosis medis final;
            untuk kondisi yang mengkhawatirkan, temui tenaga kesehatan.
          </p>
          <p className="mt-4 text-xs text-muted">
            Proyek akademik Huawei ICT &mdash; 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
