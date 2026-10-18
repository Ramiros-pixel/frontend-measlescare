import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gejalaApi, usersApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { CameraStatusBadge } from '@/components/records/StatusViews'
import { formatTanggal } from '@/lib/format'

// Angka di halaman ini selalu berasal dari API (R-17): jumlah user dari /users,
// jumlah pemeriksaan dari panjang array /gejala/history. Tidak ada delta karangan.
export default function AdminDashboardPage() {
  const users = useQuery({
    queryKey: ['users', 'list'],
    queryFn: ({ signal }) => usersApi.list(signal),
  })

  const history = useQuery({
    queryKey: ['history', 'recent', 200],
    queryFn: ({ signal }) => gejalaApi.history({ limit: 200 }, signal),
  })

  const stats = useMemo(() => {
    const items = history.data ?? []
    const withCamera = items.filter((i) => i.cameras.length > 0).length
    return {
      userCount: users.data?.length ?? null,
      recordCount: history.data ? items.length : null,
      cameraCount: history.data ? withCamera : null,
    }
  }, [users.data, history.data])

  const recent = (history.data ?? []).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Ringkasan</h1>
        <p className="mt-1 text-sm text-muted">Data terbaru dari seluruh pengguna.</p>
      </div>

      {(users.isError || history.isError) && (
        <ErrorNote
          title="Gagal memuat ringkasan"
          message={
            users.isError
              ? isNetworkError(users.error)
                ? 'Koneksi ke server terputus saat mengambil daftar pengguna.'
                : (users.error as Error).message
              : isNetworkError(history.error)
                ? 'Koneksi ke server terputus saat mengambil riwayat.'
                : (history.error as Error).message
          }
          onRetry={() => {
            void users.refetch()
            void history.refetch()
          }}
          retrying={users.isFetching || history.isFetching}
        />
      )}

      <section aria-labelledby="stat-heading">
        <h2 id="stat-heading" className="sr-only">
          Angka ringkasan
        </h2>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border-soft bg-surface p-4">
            <dt className="text-xs font-semibold text-muted">Pengguna terdaftar</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-text">
              {stats.userCount ?? <SkeletonLine className="w-12" />}
            </dd>
          </div>
          <div className="rounded-lg border border-border-soft bg-surface p-4">
            <dt className="text-xs font-semibold text-muted">Catatan pemeriksaan</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-text">
              {stats.recordCount ?? <SkeletonLine className="w-12" />}
            </dd>
          </div>
          <div className="rounded-lg border border-border-soft bg-surface p-4">
            <dt className="text-xs font-semibold text-muted">Ada deteksi kamera</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-text">
              {stats.cameraCount ?? <SkeletonLine className="w-12" />}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="recent-admin-heading">
        <div className="flex items-center justify-between">
          <h2 id="recent-admin-heading" className="text-base font-bold text-text">
            Pemeriksaan terbaru
          </h2>
          <Link
            to="/admin/pemeriksaan"
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {history.isPending && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
            <SkeletonLine className="w-52" />
            <SkeletonLine className="w-40" />
          </div>
        )}

        {history.isSuccess && recent.length === 0 && (
          <p className="mt-3 rounded-lg border border-border-soft bg-surface p-4 text-sm text-muted">
            Belum ada pemeriksaan yang tercatat.
          </p>
        )}

        {history.isSuccess && recent.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {recent.map((item) => (
              <li key={item.id_gejala}>
                <Link
                  to={`/admin/pemeriksaan/${item.id_gejala}`}
                  className="block rounded-lg border border-border-soft bg-surface p-4 hover:border-primary"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text">
                      {item.nama_user ?? 'Tanpa nama'} · {item.NIK}
                    </p>
                    {item.cameras.length > 0 && <CameraStatusBadge status={item.cameras[0].Status} />}
                  </div>
                  <p className="tabular text-sm text-muted">
                    {formatTanggal(item.Tanggal, { withTime: true })}
                    {item.Suhu !== null && <> · Suhu {item.Suhu.toFixed(1).replace('.', ',')} °C</>}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
