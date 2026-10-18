import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { cameraApi, gejalaApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { useAuth, isAdmin } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { EmptyNote, ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { CameraStatusBadge, GejalaSummary } from '@/components/records/StatusViews'
import { formatTanggal } from '@/lib/format'

const LIMIT_OPTIONS = [10, 25, 50]

export default function HistoryPage() {
  const { user } = useAuth()
  const admin = isAdmin(user)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const limit = Number(params.get('limit') ?? 10)
  const nik = params.get('nik') ?? ''
  const [nikDraft, setNikDraft] = useState(nik)

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const query = useQuery({
    queryKey: ['history', 'list', { limit, nik: admin ? nik : undefined }],
    queryFn: ({ signal }) => gejalaApi.history({ limit, nik: admin && nik ? nik : undefined }, signal),
    placeholderData: keepPreviousData,
  })

  const applyNik = () => setParam('nik', nikDraft.trim())

  return (
    <div className="flex flex-col gap-5 py-2">
      <div>
        <h1 className="text-2xl font-bold text-text">Riwayat pemeriksaan</h1>
        <p className="mt-1 text-sm text-muted">
          {admin ? 'Riwayat seluruh pengguna. Cari berdasarkan NIK.' : 'Riwayat pemeriksaan milik Anda.'}
        </p>
      </div>

      {admin && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            applyNik()
          }}
        >
          <div className="min-w-52 flex-1">
            <label htmlFor="filter-nik" className="pb-1.5 block text-sm font-semibold text-text">
              Cari NIK
            </label>
            <Input
              id="filter-nik"
              value={nikDraft}
              onChange={(e) => setNikDraft(e.target.value)}
              placeholder="16 digit NIK"
              inputMode="numeric"
              maxLength={16}
            />
          </div>
          <Button type="submit">Cari</Button>
          {nik && (
            <Button type="button" variant="ghost" onClick={() => { setNikDraft(''); setParam('nik', null) }}>
              Bersihkan
            </Button>
          )}
        </form>
      )}

      <div className="flex items-center gap-2">
        <label htmlFor="limit" className="text-sm text-muted">
          Tampilkan
        </label>
        <select
          id="limit"
          value={String(limit)}
          onChange={(e) => setParam('limit', e.target.value)}
          className="min-h-11 rounded-md border border-border-soft bg-surface px-2 text-sm"
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">catatan</span>
      </div>

      {query.isPending && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
              <SkeletonLine className="w-36" />
              <SkeletonLine className="w-60" />
            </div>
          ))}
        </div>
      )}

      {query.isError && (
        <ErrorNote
          message={
            isNetworkError(query.error)
              ? 'Koneksi ke server terputus. Periksa jaringan Anda.'
              : (query.error as Error).message
          }
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      )}

      {query.isSuccess && query.data.length === 0 && (
        <EmptyNote
          title={nik ? 'Tidak ada catatan untuk NIK ini' : 'Belum ada riwayat'}
          message={
            nik
              ? 'Periksa kembali NIK yang dimasukkan, atau bersihkan pencarian.'
              : 'Mulai pemeriksaan pertama untuk mengisi riwayat.'
          }
          action={
            nik ? undefined : <Button onClick={() => navigate('/periksa')}>Mulai pemeriksaan</Button>
          }
        />
      )}

      {query.isSuccess && query.data.length > 0 && (
        <ul className="flex flex-col gap-2">
          {query.data.map((item) => (
            <li key={item.id_gejala}>
              <Link
                to={admin ? `/admin/pemeriksaan/${item.id_gejala}` : `/hasil/${item.id_gejala}`}
                className="block rounded-lg border border-border-soft bg-surface p-4 hover:border-primary"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-text">
                    {admin && item.nama_user ? `${item.nama_user} · ${item.NIK}` : 'Pemeriksaan'}
                  </p>
                  {item.cameras.length > 0 && (
                    <CameraStatusBadge status={item.cameras[0].Status} />
                  )}
                </div>
                <GejalaSummary item={item} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {query.isSuccess && query.data.length >= limit && (
        <p className="text-xs text-muted">
          Menampilkan hingga {limit} catatan terbaru. Perbesar jumlah tampilan untuk melihat lebih
          banyak.
        </p>
      )}

      <CameraRecords />
    </div>
  )
}

// Daftar rekaman kamera dari GET /camera (user: miliknya; admin: semua).
function CameraRecords() {
  const camQuery = useQuery({
    queryKey: ['camera', 'list', 20],
    queryFn: ({ signal }) => cameraApi.list({ limit: 20 }, signal),
  })

  return (
    <section aria-labelledby="cam-heading" className="mt-4">
      <h2 id="cam-heading" className="text-base font-bold text-text">
        Rekaman kamera terbaru
      </h2>

      {camQuery.isPending && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-border-soft bg-surface p-4">
          <SkeletonLine className="w-48" />
          <SkeletonLine className="w-36" />
        </div>
      )}

      {camQuery.isError && (
        <ErrorNote
          className="mt-3"
          title="Gagal memuat rekaman kamera"
          message={
            isNetworkError(camQuery.error)
              ? 'Koneksi ke server terputus. Periksa jaringan Anda.'
              : (camQuery.error as Error).message
          }
          onRetry={() => void camQuery.refetch()}
          retrying={camQuery.isFetching}
        />
      )}

      {camQuery.isSuccess && camQuery.data.length === 0 && (
        <p className="mt-3 rounded-lg border border-border-soft bg-surface p-4 text-sm text-muted">
          Belum ada rekaman kamera. Rekam hasil deteksi dari halaman hasil pemeriksaan.
        </p>
      )}

      {camQuery.isSuccess && camQuery.data.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {camQuery.data.map((cam) => (
            <li
              key={cam.id_cam}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-soft bg-surface p-4"
            >
              <CameraStatusBadge status={cam.Status} />
              <span className="tabular text-sm text-muted">
                {formatTanggal(cam.Tanggal, { withTime: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
