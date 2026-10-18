import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { Input } from '@/components/ui/Field'
import { EmptyNote, ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'

// GET /users tidak menyediakan query pencarian (Documentation.md), jadi filter
// NIK/nama dilakukan di klien atas data yang sudah dimuat.
// TODO(api): fitur hapus pengguna menunggu endpoint DELETE di backend;
// Documentation.md belum mendefinisikannya, jadi tombol hapus belum bisa dibuat.
export default function AdminUsersPage() {
  const query = useQuery({
    queryKey: ['users', 'list'],
    queryFn: ({ signal }) => usersApi.list(signal),
  })
  const [term, setTerm] = useState('')

  const filtered = useMemo(() => {
    const items = query.data ?? []
    const t = term.trim().toLowerCase()
    if (!t) return items
    return items.filter(
      (u) => u.Name.toLowerCase().includes(t) || u.NIK.toLowerCase().includes(t),
    )
  }, [query.data, term])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Pengguna</h1>
        <p className="mt-1 text-sm text-muted">
          {query.data ? `${query.data.length} akun terdaftar.` : 'Daftar seluruh akun.'}
        </p>
      </div>

      <div className="max-w-sm">
        <label htmlFor="cari-user" className="pb-1.5 block text-sm font-semibold text-text">
          Cari nama atau NIK
        </label>
        <Input
          id="cari-user"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Ketik nama atau NIK"
        />
      </div>

      {query.isPending && (
        <div className="flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
          {[0, 1, 2].map((i) => (
            <SkeletonLine key={i} className="w-64" />
          ))}
        </div>
      )}

      {query.isError && (
        <ErrorNote
          title="Gagal memuat daftar pengguna"
          message={
            isNetworkError(query.error)
              ? 'Koneksi ke server terputus. Periksa jaringan Anda.'
              : (query.error as Error).message
          }
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      )}

      {query.isSuccess && filtered.length === 0 && (
        <EmptyNote
          title={term ? 'Tidak ada yang cocok' : 'Belum ada pengguna'}
          message={term ? 'Coba kata kunci lain.' : 'Akun baru akan muncul di sini setelah mendaftar.'}
        />
      )}

      {query.isSuccess && filtered.length > 0 && (
        <ul className="flex flex-col gap-2">
          {filtered.map((u) => (
            <li key={u.NIK}>
              <Link
                to={`/admin/pengguna/${encodeURIComponent(u.NIK)}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-soft bg-surface p-4 hover:border-primary"
              >
                <div>
                  <p className="text-sm font-semibold text-text">{u.Name}</p>
                  <p className="tabular text-sm text-muted">{u.NIK}</p>
                </div>
                <span
                  className={
                    u.id_Role === 'R1'
                      ? 'rounded-sm border border-info bg-info-soft px-2 py-0.5 text-xs font-semibold text-info'
                      : 'rounded-sm border border-border bg-surface-muted px-2 py-0.5 text-xs font-semibold text-muted'
                  }
                >
                  {u.role_name ?? u.id_Role}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
