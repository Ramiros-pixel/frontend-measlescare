import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gejalaApi, usersApi } from '@/api/endpoints'
import { isNetworkError } from '@/api/client'
import { ErrorNote } from '@/components/ui/Notes'
import { SkeletonLine } from '@/components/ui/Loaders'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { BarList, DonutChart, LineAreaChart } from '@/components/ui/Chart'
import { Icon } from '@/components/ui/Icon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CatatanData, PageHeader } from '@/components/admin/PageHeader'
import {
  URUTAN_KATEGORI,
  WARNA_KATEGORI,
  hitungStatistik,
  kategoriDari,
} from '@/lib/adminStats'
import { formatAngka, formatPersen, formatSuhu, formatTanggal } from '@/lib/format'
import type { HistoryItem } from '@/api/types'

/*
 * Dashboard admin. Semua angka berasal dari API yang sudah ada:
 * /users untuk jumlah akun, /gejala/history untuk seluruh statistik
 * skrining. Karena endpoint riwayat dibatasi ?limit=, setiap statistik
 * menyebut jumlah catatan yang jadi dasarnya.
 */

type Kategori = 'Belum Memenuhi Kriteria' | 'Mengarah ke Suspek' | 'Perlu Penanganan Segera'

const KATEGORI_TONE: Record<Kategori, 'success' | 'warning' | 'danger'> = {
  'Belum Memenuhi Kriteria': 'success',
  'Mengarah ke Suspek': 'warning',
  'Perlu Penanganan Segera': 'danger',
}

function IkonStatus({ kategori }: { kategori: Kategori }) {
  if (kategori === 'Belum Memenuhi Kriteria') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="size-full">
        <path d="m5 13 4 4L19 7" />
      </svg>
    )
  }
  if (kategori === 'Mengarah ke Suspek') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="size-full">
        <path d="M12 9v4m0 3.5v.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="size-full">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5m0 3.5v.01" />
    </svg>
  )
}

export default function AdminDashboardPage() {
  const users = useQuery({
    queryKey: ['users', 'list'],
    queryFn: ({ signal }) => usersApi.list(signal),
  })

  const history = useQuery({
    queryKey: ['history', 'admin', { limit: 200 }],
    queryFn: ({ signal }) => gejalaApi.history({ limit: 200 }, signal),
  })

  const items = useMemo(() => history.data ?? [], [history.data])
  const stat = useMemo(() => hitungStatistik(items), [items])

  const hariIni = useMemo(() => {
    const sekarang = new Date()
    return items.filter((item) => {
      const t = new Date(item.Tanggal)
      return (
        !Number.isNaN(t.getTime()) &&
        t.getFullYear() === sekarang.getFullYear() &&
        t.getMonth() === sekarang.getMonth() &&
        t.getDate() === sekarang.getDate()
      )
    }).length
  }, [items])

  const error = users.isError || history.isError

  const kolomAktivitas: Column<HistoryItem>[] = [
    {
      key: 'waktu',
      header: 'Waktu',
      render: (row) => (
        <span className="tabular text-muted">{formatTanggal(row.Tanggal, { withTime: true })}</span>
      ),
    },
    {
      key: 'id',
      header: 'ID Pasien',
      render: (row) => <span className="tabular font-semibold">{row.NIK}</span>,
    },
    {
      key: 'nama',
      header: 'Nama',
      render: (row) => row.nama_user ?? 'Tanpa nama',
    },
    {
      key: 'suhu',
      header: 'Suhu',
      render: (row) => (
        <span className="tabular">{row.Suhu !== null ? formatSuhu(row.Suhu) : '-'}</span>
      ),
    },
    {
      key: 'hasil',
      header: 'Hasil Skrining',
      render: (row) => {
        const kategori = kategoriDari(row)
        return (
          <StatusBadge
            tone={KATEGORI_TONE[kategori]}
            icon={<IkonStatus kategori={kategori} />}
            label={kategori}
          />
        )
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <Link
          to={`/admin/skrining?fokus=${encodeURIComponent(row.id_gejala)}`}
          aria-label={`Lihat detail ${row.NIK}`}
          className="inline-grid size-9 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-action-soft hover:text-action"
        >
          <Icon name="mata" className="size-4" />
        </Link>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Dashboard"
        description="Ringkasan aktivitas skrining campak di fasilitas kesehatan."
      />

      {error && (
        <ErrorNote
          title="Gagal memuat ringkasan"
          message={
            history.isError
              ? isNetworkError(history.error)
                ? 'Koneksi ke server terputus saat mengambil riwayat skrining.'
                : (history.error as Error).message
              : isNetworkError(users.error)
                ? 'Koneksi ke server terputus saat mengambil daftar pengguna.'
                : (users.error as Error).message
          }
          onRetry={() => {
            void users.refetch()
            void history.refetch()
          }}
          retrying={users.isFetching || history.isFetching}
        />
      )}

      {/* Kartu statistik */}
      <section aria-label="Statistik utama" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pasien"
          value={users.data ? formatAngka(users.data.length) : '-'}
          hint="Akun terdaftar dari API /users"
          icon={<Icon name="pasien" className="size-5" />}
          loading={users.isPending}
        />
        <StatCard
          label="Skrining Hari Ini"
          value={history.isPending ? '-' : formatAngka(hariIni)}
          hint="Catatan skrining yang tercatat hari ini"
          icon={<Icon name="skrining" className="size-5" />}
          tone="neutral"
          loading={history.isPending}
        />
        <StatCard
          label="Mengarah ke Suspek"
          value={history.isPending ? '-' : formatAngka(stat.perKategori['Mengarah ke Suspek'])}
          hint={`${formatPersen(stat.persenKategori['Mengarah ke Suspek'])} dari ${formatAngka(stat.total)} catatan`}
          badge={history.isPending ? undefined : formatPersen(stat.persenKategori['Mengarah ke Suspek'])}
          badgeTone="warning"
          icon={<Icon name="peringatan" className="size-5" />}
          tone="warning"
          loading={history.isPending}
        />
        <StatCard
          label="Perlu Penanganan Segera"
          value={history.isPending ? '-' : formatAngka(stat.perKategori['Perlu Penanganan Segera'])}
          hint={`${formatPersen(stat.persenKategori['Perlu Penanganan Segera'])} dari ${formatAngka(stat.total)} catatan`}
          badge={history.isPending ? undefined : formatPersen(stat.persenKategori['Perlu Penanganan Segera'])}
          badgeTone="danger"
          icon={<Icon name="info" className="size-5" />}
          tone="danger"
          loading={history.isPending}
        />
      </section>

      {/* Tren dan distribusi */}
      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader
            title="Tren Jumlah Skrining (7 Hari Terakhir)"
            description="Jumlah catatan skrining per hari berdasarkan tanggal pencatatan."
          />
          <div className="px-4 pb-4">
            {history.isPending ? (
              <div className="flex flex-col gap-3 py-6">
                <SkeletonLine className="h-40 w-full" />
              </div>
            ) : (
              <LineAreaChart data={stat.tren} />
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Distribusi Hasil Skrining"
            description="Kategori dihitung dari suhu dan gejala yang tercatat."
          />
          <div className="px-5 pb-5">
            {history.isPending ? (
              <SkeletonLine className="h-40 w-full" />
            ) : (
              <DonutChart
                segments={URUTAN_KATEGORI.map((k) => ({
                  label: k,
                  value: stat.perKategori[k],
                  color: WARNA_KATEGORI[k],
                }))}
                centerValue={formatAngka(stat.total)}
                centerLabel="Skrining"
              />
            )}
          </div>
        </Card>
      </section>

      {/* Gejala dan aktivitas */}
      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Gejala Paling Banyak Ditemukan"
            description="Persentase dari catatan yang memuat gejala tersebut."
          />
          <div className="px-5 pb-5">
            {history.isPending ? (
              <div className="flex flex-col gap-3 py-4">
                <SkeletonLine className="w-full" />
                <SkeletonLine className="w-full" />
              </div>
            ) : (
              <BarList
                items={stat.gejala.map((g) => ({
                  label: g.label,
                  percent: g.percent,
                  value: 0,
                  icon: <Icon name={g.icon} className="size-4" />,
                }))}
              />
            )}
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader
            title="Aktivitas Skrining Terbaru"
            description="Catatan skrining terakhir yang berhasil diambil dari server."
            actions={
              <Link
                to="/admin/skrining"
                className="text-sm font-semibold text-action underline-offset-2 hover:underline"
              >
                Lihat Semua
              </Link>
            }
          />
          <DataTable
            columns={kolomAktivitas}
            rows={stat.terbaru}
            rowKey={(row) => row.id_gejala}
            loading={history.isPending}
            emptyMessage="Belum ada catatan skrining yang tersedia."
          />
        </Card>
      </section>

      <CatatanData>
        Statistik dihitung dari {formatAngka(stat.total)} catatan skrining yang dimuat dari endpoint
        /gejala/history (batas 200 catatan per permintaan), bukan dari keseluruhan riwayat
        historis. Kategori hasil disusun dari suhu tubuh dan gejala yang tercatat, mengikuti
        ambang pada aturan skrining.
      </CatatanData>
    </div>
  )
}
