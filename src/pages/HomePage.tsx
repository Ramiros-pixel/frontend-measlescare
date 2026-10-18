import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gejalaApi } from '@/api/endpoints'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { EmptyNote, ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { GejalaSummary } from '@/components/records/StatusViews'
import { isNetworkError } from '@/api/client'

export default function HomePage() {
  const { user } = useAuth()
  const history = useQuery({
    queryKey: ['history', 'recent', 3],
    queryFn: ({ signal }) => gejalaApi.history({ limit: 3 }, signal),
  })

  return (
    <div className="flex flex-col gap-6 py-2">
      <section>
        <h1 className="text-2xl font-bold text-text">Halo, {user?.Name}</h1>
        <p className="mt-1 text-sm text-muted">Catat gejala Anda atau buka riwayat pemeriksaan.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => (window.location.href = '/periksa')}>Mulai pemeriksaan</Button>
          <Button variant="secondary" onClick={() => (window.location.href = '/riwayat')}>
            Buka riwayat
          </Button>
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-base font-bold text-text">
            Pemeriksaan terakhir
          </h2>
          <Link to="/riwayat" className="text-sm font-semibold text-primary underline-offset-2 hover:underline">
            Lihat semua
          </Link>
        </div>

        <div className="mt-3">
          {history.isPending && (
            <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-4">
              <SkeletonLine className="w-40" />
              <SkeletonLine className="w-64" />
            </div>
          )}
          {history.isError && (
            <ErrorNote
              message={
                isNetworkError(history.error)
                  ? 'Koneksi ke server terputus. Periksa jaringan Anda.'
                  : (history.error as Error).message
              }
              onRetry={() => void history.refetch()}
              retrying={history.isFetching}
            />
          )}
          {history.isSuccess && history.data.length === 0 && (
            <EmptyNote
              title="Belum ada pemeriksaan"
              message="Mulai pemeriksaan pertama Anda untuk melihat catatannya di sini."
              action={<Button onClick={() => (window.location.href = '/periksa')}>Mulai pemeriksaan</Button>}
            />
          )}
          {history.isSuccess && history.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {history.data.map((item) => (
                <li key={item.id_gejala}>
                  <Link
                    to={`/hasil/${item.id_gejala}`}
                    className="block rounded-lg border border-border-soft bg-surface p-4 hover:border-primary"
                  >
                    <p className="text-sm font-semibold text-text">Pemeriksaan {item.id_gejala.slice(0, 8)}</p>
                    <GejalaSummary item={item} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-muted">
        Hasil pemeriksaan bukan diagnosis medis final. Untuk kondisi yang mengkhawatirkan, temui
        tenaga kesehatan.
      </p>
    </div>
  )
}
