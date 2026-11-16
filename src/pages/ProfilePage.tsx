import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/endpoints'
import { ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { isNetworkError } from '@/api/client'

export default function ProfilePage() {
  const detail = useQuery({
    queryKey: ['users', 'me'],
    queryFn: ({ signal }) => usersApi.me(signal),
    retry: false,
  })

  const data = detail.data

  return (
    <div className="flex flex-col gap-5 py-2">
      <h1 className="text-2xl font-bold text-text">Profil</h1>

      {detail.isPending && (
        <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonLine key={i} className="w-56" />
          ))}
        </div>
      )}

      {detail.isError && (
        <ErrorNote
          title="Gagal memuat profil"
          message={
            isNetworkError(detail.error)
              ? 'Koneksi ke server terputus. Periksa jaringan Anda.'
              : (detail.error as Error).message
          }
          onRetry={() => void detail.refetch()}
          retrying={detail.isFetching}
        />
      )}

      {data && (
        <section className="rounded-lg border border-border-soft bg-surface p-4">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">Nama</dt>
              <dd className="text-sm text-text">{data.Name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">NIK</dt>
              <dd className="tabular text-sm text-text">{data.NIK}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Tanggal lahir</dt>
              <dd className="tabular text-sm text-text">{data.Tempat_Tgl_Lahir || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Peran</dt>
              <dd className="text-sm text-text">{data.role_name ?? data.id_Role}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold text-muted">Alamat</dt>
              <dd className="text-sm text-text">{data.Alamat?.trim() ? data.Alamat : 'Tidak diisi'}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
