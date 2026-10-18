import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { gejalaApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { Input, Select } from '@/components/ui/Field'
import { EmptyNote, ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { CameraStatusBadge } from '@/components/records/StatusViews'
import { formatSuhu, formatTanggal } from '@/lib/format'

// GET /gejala/history hanya menyediakan limit dan nik; urutan dan pencarian teks
// dilakukan di klien atas data yang dimuat.
export default function AdminRecordsPage() {
  const [params, setParams] = useSearchParams()
  const limit = Number(params.get('limit') ?? 50)
  const nik = params.get('nik') ?? ''
  const sort = params.get('urut') ?? 'terbaru'
  const [nikDraft, setNikDraft] = useState(nik)
  const [term, setTerm] = useState('')

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const query = useQuery({
    queryKey: ['history', 'admin', { limit, nik }],
    queryFn: ({ signal }) => gejalaApi.history({ limit, nik: nik || undefined }, signal),
    placeholderData: keepPreviousData,
  })

  const filtered = useMemo(() => {
    const items = query.data ?? []
    const t = term.trim().toLowerCase()
    const result = t
      ? items.filter(
          (i) =>
            i.NIK.toLowerCase().includes(t) ||
            (i.nama_user ?? '').toLowerCase().includes(t) ||
            (i.Batuk ?? '').toLowerCase().includes(t),
        )
      : items
    return [...result].sort((a, b) => {
      const diff = new Date(a.Tanggal).getTime() - new Date(b.Tanggal).getTime()
      return sort === 'terlama' ? diff : -diff
    })
  }, [query.data, term, sort])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-text">Pemeriksaan</h1>
        <p className="mt-1 text-sm text-muted">
          {query.data ? `${query.data.length} catatan dimuat.` : 'Seluruh catatan pemeriksaan pengguna.'}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-52 flex-1 sm:max-w-xs">
          <label htmlFor="filter-nik" className="block pb-1.5 text-sm font-semibold text-text">
            Filter NIK
          </label>
          <Input
            id="filter-nik"
            value={nikDraft}
            onChange={(e) => setNikDraft(e.target.value)}
            onBlur={() => setParam('nik', nikDraft.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setParam('nik', nikDraft.trim())
            }}
            placeholder="16 digit NIK"
            inputMode="numeric"
            maxLength={16}
          />
        </div>
        <div>
          <label htmlFor="sort" className="block pb-1.5 text-sm font-semibold text-text">
            Urutkan
          </label>
          <Select id="sort" value={sort} onChange={(e) => setParam('urut', e.target.value)}>
            <option value="terbaru">Terbaru dulu</option>
            <option value="terlama">Terlama dulu</option>
          </Select>
        </div>
        <div className="min-w-52 flex-1 sm:max-w-xs">
          <label htmlFor="cari" className="block pb-1.5 text-sm font-semibold text-text">
            Cari
          </label>
          <Input
            id="cari"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nama, NIK, atau batuk"
          />
        </div>
        <div>
          <label htmlFor="limit" className="block pb-1.5 text-sm font-semibold text-text">
            Jumlah
          </label>
          <Select id="limit" value={String(limit)} onChange={(e) => setParam('limit', e.target.value)}>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </Select>
        </div>
        {(nik || term || sort !== 'terbaru') && (
          <button
            type="button"
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-primary hover:bg-primary-soft"
            onClick={() => {
              setNikDraft('')
              setTerm('')
              setParams(new URLSearchParams(), { replace: true })
            }}
          >
            Bersihkan filter
          </button>
        )}
      </div>

      {query.isPending && (
        <div className="flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonLine key={i} className="w-72" />
          ))}
        </div>
      )}

      {query.isError && (
        <ErrorNote
          title="Gagal memuat pemeriksaan"
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
          title={nik || term ? 'Tidak ada catatan yang cocok' : 'Belum ada pemeriksaan'}
          message={
            nik || term
              ? 'Ubah filter atau kata kunci pencarian.'
              : 'Catatan baru muncul di sini setelah pengguna memeriksakan diri.'
          }
        />
      )}

      {query.isSuccess && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border-soft bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-soft text-xs text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">Waktu</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
                <th scope="col" className="px-4 py-3 font-semibold">NIK</th>
                <th scope="col" className="px-4 py-3 font-semibold">Suhu</th>
                <th scope="col" className="px-4 py-3 font-semibold">Batuk</th>
                <th scope="col" className="px-4 py-3 font-semibold">Kamera</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id_gejala} className="border-b border-border-soft last:border-0">
                  <td className="tabular px-4 py-3 text-muted">{formatTanggal(item.Tanggal, { withTime: true })}</td>
                  <td className="px-4 py-3">{item.nama_user ?? 'Tanpa nama'}</td>
                  <td className="tabular px-4 py-3 text-muted">{item.NIK}</td>
                  <td className="tabular px-4 py-3">{item.Suhu !== null ? formatSuhu(item.Suhu) : '-'}</td>
                  <td className="px-4 py-3">{item.Batuk || '-'}</td>
                  <td className="px-4 py-3">
                    {item.cameras.length > 0 ? <CameraStatusBadge status={item.cameras[0].Status} /> : <span className="text-muted">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/pemeriksaan/${item.id_gejala}`}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
