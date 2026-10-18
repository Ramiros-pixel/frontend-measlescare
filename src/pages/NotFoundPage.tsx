import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold text-text">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-muted">
        Alamat yang Anda buka tidak ada atau sudah dipindahkan.
      </p>
      <Button onClick={() => (window.location.href = '/beranda')}>Ke beranda</Button>
      <Link to="/" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
        Ke halaman awal
      </Link>
    </div>
  )
}
