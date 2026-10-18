import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cameraApi, gejalaApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { useAuth, isAdmin } from '@/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { EmptyNote, ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { CameraStatusBadge } from '@/components/records/StatusViews'
import { formatSuhu, formatTanggal } from '@/lib/format'

export default function ResultPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const admin = isAdmin(user)
  const queryClient = useQueryClient()
  const detailRef = useRef<HTMLDivElement>(null)
  const [statusInput, setStatusInput] = useState('')
  const [statusError, setStatusError] = useState<string | null>(null)

  const query = useQuery({
    queryKey: ['gejala', id],
    queryFn: ({ signal }) => gejalaApi.detail(id, signal),
    enabled: Boolean(id),
  })

  const cameraMutation = useMutation({
    mutationFn: (status: string | null) =>
      cameraApi.create({ Status: status, id_gejala: id }),
    onSuccess: () => {
      setStatusInput('')
      void queryClient.invalidateQueries({ queryKey: ['gejala', id] })
    },
  })

  useEffect(() => {
    if (location.state && (location.state as { fotoDianalisis?: boolean }).fotoDianalisis) {
      detailRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [location.state])

  const submitStatus = () => {
    const value = statusInput.trim()
    if (value.length > 50) {
      setStatusError('Status maksimal 50 karakter.')
      return
    }
    setStatusError(null)
    cameraMutation.mutate(value || null)
  }

  if (!id) {
    return (
      <div className="py-2">
        <ErrorNote message="ID pemeriksaan tidak ada di alamat. Buka pemeriksaan dari riwayat." />
      </div>
    )
  }

  return (
    <div ref={detailRef} className="flex flex-col gap-6 py-2">
      <div>
        <Link
          to={admin ? '/admin/pemeriksaan' : '/riwayat'}
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Kembali ke {admin ? 'daftar pemeriksaan' : 'riwayat'}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text">Hasil pemeriksaan</h1>
      </div>

      {query.isPending && (
        <div className="flex flex-col gap-3 rounded-lg border border-border-soft bg-surface p-4">
          <SkeletonLine className="w-32" />
          <SkeletonLine className="w-56" />
          <SkeletonLine className="w-44" />
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

      {query.isSuccess && query.data && (
        <>
          <section className="rounded-lg border border-border-soft bg-surface p-4">
            <h2 className="text-base font-bold text-text">Data gejala</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-muted">Waktu pencatatan</dt>
                <dd className="tabular text-sm text-text">{formatTanggal(query.data.Tanggal, { withTime: true })}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">Suhu</dt>
                <dd className="tabular text-sm text-text">
                  {query.data.Suhu !== null ? formatSuhu(query.data.Suhu) : 'Tidak dicatat'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">Batuk</dt>
                <dd className="text-sm text-text">{query.data.Batuk || 'Tidak dicatat'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-muted">Nama pemilik</dt>
                <dd className="text-sm text-text">
                  {admin ? (query.data.nama_user ?? 'Tanpa nama') : (user?.Name ?? 'Anda')}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border-soft bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text">Deteksi kamera</h2>
              <span className="text-xs text-muted">{query.data.cameras.length} rekaman</span>
            </div>

            {query.data.cameras.length === 0 ? (
              <EmptyNote
                className="mt-3"
                title="Belum ada deteksi kamera"
                message="Rekam hasil deteksi di bawah bila model kamera menghasilkan status untuk pemeriksaan ini."
              />
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {query.data.cameras.map((cam) => (
                  <li key={cam.id_cam} className="rounded-md border border-border-soft px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CameraStatusBadge status={cam.Status} />
                      <span className="tabular text-xs text-muted">{formatTanggal(cam.Tanggal, { withTime: true })}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t border-border-soft pt-4">
              <Field
                label="Catat hasil deteksi"
                htmlFor="camera-status"
                error={statusError ?? cameraMutation.error?.message}
                hint="Maksimal 50 karakter. Contoh: normal, terdeteksi mengantuk."
              >
                <Input
                  id="camera-status"
                  value={statusInput}
                  maxLength={50}
                  invalid={Boolean(statusError || cameraMutation.error)}
                  onChange={(e) => setStatusInput(e.target.value)}
                  placeholder="Status hasil deteksi"
                />
              </Field>
              <Button
                type="button"
                className="mt-2"
                loading={cameraMutation.isPending}
                onClick={submitStatus}
              >
                Rekam deteksi
              </Button>
            </div>
          </section>

          <p className="text-xs text-muted">
            Hasil pemeriksaan bukan diagnosis medis final. Untuk kondisi yang mengkhawatirkan, temui
            tenaga kesehatan.
          </p>
        </>
      )}
    </div>
  )
}
