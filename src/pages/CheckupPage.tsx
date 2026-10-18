import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { gejalaApi } from '@/api/endpoints'
import { ApiError, isNetworkError } from '@/api/client'
import { useCameraCapture } from '@/hooks/useCameraCapture'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { PhotoPicker } from '@/components/camera/PhotoPicker'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { ErrorNote } from '@/components/ui/Notes'

type BatukValue = '' | 'kering' | 'berdahak'

// Suhu dan Batuk adalah satu-satunya field yang diterima POST /gejala
// (Documentation.md); kontrol lain tidak dikirim agar tidak berbohong soal skema.
// TODO(api): Documentation.md belum memiliki endpoint untuk mengunggah berkas
// gambar hasil kamera (multipart/base64 tidak disebut). Foto hanya pratinjau
// lokal; hasil deteksi dicatat lewat POST /camera di halaman Hasil. Konfirmasi
// ke pemilik backend bila endpoint unggah tersedia.
export default function CheckupPage() {
  const navigate = useNavigate()
  const camera = useCameraCapture()
  const [suhu, setSuhu] = useState('')
  const [batuk, setBatuk] = useState<BatukValue>('')
  const [errors, setErrors] = useState<{ suhu?: string; batuk?: string }>({})
  const [photo, setPhoto] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  const submitMutation = useMutation({
    mutationFn: () => {
      const suhuValue = suhu.trim() === '' ? null : Number(suhu.replace(',', '.'))
      return gejalaApi.create({
        Suhu: suhuValue,
        Batuk: batuk === '' ? null : batuk,
      })
    },
    onSuccess: (gejala) => {
      camera.stop()
      navigate(`/hasil/${gejala.id_gejala}`, {
        state: photo ? { fotoDianalisis: true } : undefined,
      })
    },
  })

  const startCamera = async () => {
    setCameraError(null)
    await camera.start('environment')
  }

  const handleSnap = () => {
    const dataUrl = camera.snap()
    if (!dataUrl) {
      setCameraError('Gagal mengambil gambar. Coba lagi.')
      return
    }
    setPhoto(dataUrl)
    setCameraError(null)
  }

  const handleFile = (file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPhoto(url)
    setCameraError(null)
  }

  const retake = () => {
    setPhoto(null)
    setCameraError(null)
  }

  const validate = () => {
    const errs: typeof errors = {}
    if (suhu.trim() !== '') {
      const n = Number(suhu.replace(',', '.'))
      if (Number.isNaN(n)) errs.suhu = 'Suhu harus berupa angka.'
      else if (n < 30 || n > 45) errs.suhu = 'Suhu harus antara 30 dan 45 °C.'
    }
    if (batuk !== '' && batuk.length > 20) errs.batuk = 'Keterangan batuk maksimal 20 karakter.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (submitMutation.isPending) return
    if (!validate()) return
    submitMutation.mutate()
  }

  const mutationError = submitMutation.error
    ? isNetworkError(submitMutation.error)
      ? 'Koneksi ke server terputus. Periksa jaringan Anda, lalu coba lagi.'
      : (submitMutation.error as ApiError).message
    : null

  const cameraHint =
    camera.phase === 'denied'
      ? 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan peramban, atau unggah foto sebagai gantinya.'
      : camera.phase === 'unavailable'
        ? 'Kamera tidak ditemukan di perangkat ini. Unggah foto sebagai gantinya.'
        : camera.phase === 'error'
          ? 'Kamera gagal dijalankan. Coba lagi atau unggah foto.'
          : null

  return (
    <div className="flex flex-col gap-6 py-2">
      <section>
        <h1 className="text-2xl font-bold text-text">Pemeriksaan baru</h1>
        <p className="mt-1 text-sm text-muted">
          Isi gejala yang dirasakan. Semua kolom opsional, tetapi isi minimal satu agar ada yang
          tercatat.
        </p>
      </section>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <section className="rounded-lg border border-border-soft bg-surface p-4">
          <h2 className="text-base font-bold text-text">Gejala</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Suhu tubuh"
              htmlFor="suhu"
              error={errors.suhu}
              hint="Dalam °C, antara 30 dan 45. Kosongkan bila tidak diukur."
            >
              <Input
                id="suhu"
                inputMode="decimal"
                value={suhu}
                invalid={Boolean(errors.suhu)}
                onChange={(e) => setSuhu(e.target.value)}
                placeholder="36,8"
              />
            </Field>
            <Field label="Jenis batuk" htmlFor="batuk" error={errors.batuk}>
              <Select
                id="batuk"
                value={batuk}
                invalid={Boolean(errors.batuk)}
                onChange={(e) => setBatuk(e.target.value as BatukValue)}
              >
                <option value="">Tidak dipilih</option>
                <option value="kering">Kering</option>
                <option value="berdahak">Berdahak</option>
              </Select>
            </Field>
          </div>
        </section>

        <section className="rounded-lg border border-border-soft bg-surface p-4">
          <h2 className="text-base font-bold text-text">Foto lewat kamera</h2>
          <p className="mt-1 text-sm text-muted">
            Opsional. Foto dipakai sebagai pratinjau pemeriksaan di perangkat Anda.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {camera.phase !== 'live' && camera.phase !== 'starting' && (
              <Button type="button" variant="secondary" onClick={() => void startCamera()}>
                Aktifkan kamera
              </Button>
            )}

            <CameraCapture videoRef={camera.videoRef} canvasRef={camera.canvasRef} active={camera.phase === 'live'} />

            {camera.phase === 'starting' && <p className="text-sm text-muted">Menyiapkan kamera...</p>}
            {cameraHint && (
              <p role="status" className="text-sm text-warning">
                {cameraHint}
              </p>
            )}

            {camera.phase === 'live' && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleSnap}>
                  Ambil gambar
                </Button>
                <Button type="button" variant="secondary" onClick={camera.switchFacing}>
                  Ganti kamera
                </Button>
                <Button type="button" variant="ghost" onClick={camera.stop}>
                  Matikan kamera
                </Button>
              </div>
            )}

            <PhotoPicker onPick={handleFile} error={cameraError ?? undefined} />
          </div>
        </section>

        {photo && (
          <section className="rounded-lg border border-border-soft bg-surface p-4">
            <h2 className="text-base font-bold text-text">Gambar yang dianalisis</h2>
            <img
              src={photo}
              alt="Foto yang dianalisis"
              className="mt-3 max-h-72 rounded-md border border-border-soft object-contain"
            />
            <div className="mt-3">
              <Button type="button" variant="ghost" onClick={retake}>
                Ambil ulang
              </Button>
            </div>
          </section>
        )}

        {(formError || mutationError) && <ErrorNote message={formError ?? mutationError ?? ''} />}

        <Button type="submit" size="lg" loading={submitMutation.isPending}>
          {submitMutation.isPending ? 'Menyimpan...' : 'Simpan pemeriksaan'}
        </Button>
      </form>

      <p className="text-xs text-muted">
        Hasil pemeriksaan bukan diagnosis medis final. Untuk kondisi yang mengkhawatirkan, temui
        tenaga kesehatan.
      </p>
    </div>
  )
}
