import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gejalaApi, usersApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { EmptyNote, ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { CameraStatusBadge } from '@/components/records/StatusViews'
import { formatSuhu, formatTanggal } from '@/lib/format'

export default function AdminUserDetailPage() {
  const { nik = '' } = useParams()

  const user = useQuery({
    queryKey: ['users', 'detail', nik],
    queryFn: ({ signal }) => usersApi.detail(nik, signal),
    enabled: Boolean(nik),
  })

  const history = useQuery({
    queryKey: ['history', 'list', { nik }],
    queryFn: ({ signal }) => gejalaApi.history({ limit: 50, nik }, signal),
    enabled: Boolean(nik),
  })

  if (!nik) {
    return <ErrorNote message="NIK tidak ada di alamat. Buka daftar pengguna untuk memilih akun." />
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          to="/admin/pengguna"
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Kembali ke daftar pengguna
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text">Detail pengguna</h1>
      </div>

      {user.isPending && (
        <div className="flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
          <SkeletonLine className="w-48" />
          <SkeletonLine className="w-36" />
        </div>
      )}

      {user.isError && (
        <ErrorNote
          title="Gagal memuat pengguna"
          message={
            isNetworkError(user.error)
              ? 'Koneksi ke server terputus. Periksa jaringan Anda.'
              : (user.error as Error).message
          }
          onRetry={() => void user.refetch()}
          retrying={user.isFetching}
        />
      )}

      {user.isSuccess && user.data && (
        <section className="rounded-lg border border-border-soft bg-surface p-4">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">Nama</dt>
              <dd className="text-sm text-text">{user.data.Name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">NIK</dt>
              <dd className="tabular text-sm text-text">{user.data.NIK}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Tanggal lahir</dt>
              <dd className="tabular text-sm text-text">{user.data.Tempat_Tgl_Lahir || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Peran</dt>
              <dd className="text-sm text-text">{user.data.role_name ?? user.data.id_Role}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted">Alamat</dt>
              <dd className="text-sm text-text">
                {user.data.Alamat?.trim() ? user.data.Alamat : 'Tidak diisi'}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <section aria-labelledby="user-history-heading">
        <h2 id="user-history-heading" className="text-base font-bold text-text">
          Riwayat pemeriksaan pengguna ini
        </h2>

        {history.isPending && (
          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
            <SkeletonLine className="w-56" />
            <SkeletonLine className="w-40" />
          </div>
        )}

        {history.isError && (
          <ErrorNote
            className="mt-3"
            title="Gagal memuat riwayat"
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
            className="mt-3"
            title="Belum ada pemeriksaan"
            message="Pengguna ini belum mencatat gejala apa pun."
          />
        )}

        {history.isSuccess && history.data.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {history.data.map((item) => (
              <li key={item.id_gejala}>
                <Link
                  to={`/admin/pemeriksaan/${item.id_gejala}`}
                  className="block rounded-lg border border-border-soft bg-surface p-4 hover:border-primary"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="tabular text-sm text-muted">
                      {formatTanggal(item.Tanggal, { withTime: true })}
                    </span>
                    {item.cameras.length > 0 && <CameraStatusBadge status={item.cameras[0].Status} />}
                  </div>
                  <p className="text-sm text-text">
                    {item.Suhu !== null ? `Suhu ${formatSuhu(item.Suhu)}` : 'Suhu tidak dicatat'}
                    {item.Batuk && ` · Batuk ${item.Batuk}`}
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
