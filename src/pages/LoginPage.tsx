import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ApiError, isNetworkError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sesiHabis = params.get('sesi') === 'habis'

  const [nik, setNik] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ nik?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!nik.trim()) errs.nik = 'NIK wajib diisi.'
    if (!password) errs.password = 'Kata sandi wajib diisi.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!validate() || busy) return
    setBusy(true)
    try {
      const me = await login(nik.trim(), password)
      navigate(me.id_Role === 'R1' ? '/admin' : '/beranda', { replace: true })
    } catch (err) {
      if (isNetworkError(err)) {
        setFormError('Tidak bisa menghubungi server. Periksa koneksi, lalu coba lagi.')
      } else if (err instanceof ApiError) {
        setFormError(err.status === 401 ? 'NIK atau kata sandi salah.' : err.message)
      } else {
        setFormError('Terjadi kesalahan. Coba lagi.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-text">Masuk ke MeaslesCare</h1>
        <p className="mt-1 text-sm text-muted">Gunakan NIK dan kata sandi akun Anda.</p>

        {sesiHabis && (
          <p role="status" className="mt-4 rounded-md border border-info bg-info-soft px-3 py-2 text-sm text-info">
            Sesi Anda berakhir. Masuk kembali untuk melanjutkan.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          {formError && (
            <p role="alert" className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}
          <Field label="NIK" htmlFor="nik" error={fieldErrors.nik} required>
            <Input
              id="nik"
              name="nik"
              inputMode="numeric"
              autoComplete="username"
              maxLength={16}
              value={nik}
              invalid={Boolean(fieldErrors.nik)}
              onChange={(e) => setNik(e.target.value)}
              placeholder="16 digit NIK"
            />
          </Field>
          <Field label="Kata sandi" htmlFor="password" error={fieldErrors.password} required>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              invalid={Boolean(fieldErrors.password)}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi Anda"
            />
          </Field>
          <Button type="submit" size="lg" loading={busy}>
            {busy ? 'Memeriksa...' : 'Masuk'}
          </Button>
        </form>

        <p className="mt-5 text-sm text-muted">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary underline-offset-2 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
