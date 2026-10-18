import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    return <Navigate to={user.id_Role === 'R1' ? '/admin' : '/beranda'} replace />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="flex items-center justify-between px-5 py-4 sm:px-10">
        <span className="text-base font-bold text-primary">MeaslesCare</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => (window.location.href = '/login')}>
            Masuk
          </Button>
          <Button onClick={() => (window.location.href = '/register')}>Daftar akun</Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 pt-10 sm:px-10 sm:pt-20">
        <h1 className="text-3xl font-bold leading-tight text-text sm:text-4xl">
          Catat gejala campak, periksa lewat kamera, simpan riwayatnya.
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted">
          MeaslesCare membantu Anda mencatat suhu dan batuk, mengambil foto lewat kamera untuk
          dideteksi, lalu menyimpan semuanya sebagai riwayat yang bisa dibuka kapan saja.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => (window.location.href = '/register')}>
            Buat akun sekarang
          </Button>
          <Button size="lg" variant="secondary" onClick={() => (window.location.href = '/login')}>
            Masuk ke akun
          </Button>
        </div>

        <section className="mt-14 border-t border-border-soft pt-8">
          <h2 className="text-lg font-bold text-text">Yang bisa Anda lakukan di sini</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-muted">
            <li>Catat suhu tubuh dan jenis batuk sesuai validasi resmi (suhu 30 sampai 45 °C).</li>
            <li>Ambil foto lewat kamera perangkat untuk pemeriksaan lanjutan.</li>
            <li>Buka riwayat pemeriksaan Anda sendiri, lengkap dengan hasil deteksi kamera.</li>
          </ul>
          <p className="mt-6 text-xs text-muted">
            MeaslesCare membantu pencatatan dan deteksi dini. Hasil bukan diagnosis medis final;
            untuk kondisi yang mengkhawatirkan, temui tenaga kesehatan.
          </p>
        </section>
      </main>
    </div>
  )
}
