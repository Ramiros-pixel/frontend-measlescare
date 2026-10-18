import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { ApiError, isNetworkError } from '@/api/client'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'

interface FormState {
  NIK: string
  Name: string
  Tgl_lahir: string
  Alamat: string
  id_Role: string
  password: string
  confirm: string
}

const INITIAL: FormState = {
  NIK: '',
  Name: '',
  Tgl_lahir: '',
  Alamat: '',
  id_Role: 'R2',
  password: '',
  confirm: '',
}

// Validasi klien selaras dengan skema UserCreate: NIK 16 digit, nama maks 100,
// tanggal lahir wajib, kata sandi minimal 6 karakter. Detail 422 dari server
// tetap ditampilkan per field bila lolos dari sisi klien.
function validate(form: FormState) {
  const errs: Partial<Record<keyof FormState, string>> = {}
  if (!/^\d{16}$/.test(form.NIK)) errs.NIK = 'NIK harus tepat 16 digit angka.'
  if (!form.Name.trim()) errs.Name = 'Nama wajib diisi.'
  else if (form.Name.trim().length > 100) errs.Name = 'Nama maksimal 100 karakter.'
  if (!form.Tgl_lahir) errs.Tgl_lahir = 'Tanggal lahir wajib diisi.'
  if (form.Alamat.trim().length > 200) errs.Alamat = 'Alamat maksimal 200 karakter.'
  if (!['R1', 'R2'].includes(form.id_Role)) errs.id_Role = 'Peran tidak valid.'
  if (form.password.length < 6) errs.password = 'Kata sandi minimal 6 karakter.'
  if (form.confirm !== form.password) errs.confirm = 'Konfirmasi tidak sama dengan kata sandi.'
  return errs
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0 || busy) return
    setBusy(true)
    try {
      const me = await register({
        NIK: form.NIK,
        Name: form.Name.trim(),
        Tgl_lahir: form.Tgl_lahir,
        Alamat: form.Alamat.trim() || null,
        id_Role: form.id_Role,
        password: form.password,
      })
      navigate(me.id_Role === 'R1' ? '/admin' : '/beranda', { replace: true })
    } catch (err) {
      if (isNetworkError(err)) {
        setFormError('Tidak bisa menghubungi server. Periksa koneksi, lalu coba lagi.')
      } else if (err instanceof ApiError) {
        if (err.fields) {
          const mapped: Partial<Record<keyof FormState, string>> = {}
          for (const [k, v] of Object.entries(err.fields)) {
            if (k in form) mapped[k as keyof FormState] = v
          }
          setErrors(mapped)
        }
        setFormError(err.message)
      } else {
        setFormError('Terjadi kesalahan. Coba lagi.')
      }
    } finally {
      setBusy(false)
    }
  }

  const maxBirth = '2100-12-31'

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold text-text">Daftar akun MeaslesCare</h1>
      <p className="mt-1 text-sm text-muted">Data ini tersimpan sebagai identitas riwayat pemeriksaan Anda.</p>

      <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
        {formError && (
          <p role="alert" className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        )}
        <Field label="NIK" htmlFor="NIK" error={errors.NIK} hint="16 digit sesuai kartu identitas." required>
          <Input
            id="NIK"
            inputMode="numeric"
            autoComplete="off"
            maxLength={16}
            value={form.NIK}
            invalid={Boolean(errors.NIK)}
            onChange={(e) => set('NIK')(e.target.value.replace(/\D/g, ''))}
            placeholder="3201234567890001"
          />
        </Field>
        <Field label="Nama lengkap" htmlFor="Name" error={errors.Name} required>
          <Input
            id="Name"
            autoComplete="name"
            maxLength={100}
            value={form.Name}
            invalid={Boolean(errors.Name)}
            onChange={(e) => set('Name')(e.target.value)}
            placeholder="Nama sesuai identitas"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal lahir" htmlFor="Tgl_lahir" error={errors.Tgl_lahir} required>
            <Input
              id="Tgl_lahir"
              type="date"
              max={maxBirth}
              value={form.Tgl_lahir}
              invalid={Boolean(errors.Tgl_lahir)}
              onChange={(e) => set('Tgl_lahir')(e.target.value)}
            />
          </Field>
          <Field label="Peran" htmlFor="id_Role" error={errors.id_Role} required>
            <Select
              id="id_Role"
              value={form.id_Role}
              invalid={Boolean(errors.id_Role)}
              onChange={(e) => set('id_Role')(e.target.value)}
            >
              <option value="R2">Pengguna</option>
              <option value="R1">Admin</option>
            </Select>
          </Field>
        </div>
        <Field label="Alamat" htmlFor="Alamat" error={errors.Alamat} hint="Opsional.">
          <Input
            id="Alamat"
            autoComplete="street-address"
            maxLength={200}
            value={form.Alamat}
            invalid={Boolean(errors.Alamat)}
            onChange={(e) => set('Alamat')(e.target.value)}
            placeholder="Contoh: Jl. Merdeka No. 10, Bandung"
          />
        </Field>
        <Field label="Kata sandi" htmlFor="password" error={errors.password} hint="Minimal 6 karakter." required>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            invalid={Boolean(errors.password)}
            onChange={(e) => set('password')(e.target.value)}
          />
        </Field>
        <Field label="Ulangi kata sandi" htmlFor="confirm" error={errors.confirm} required>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            invalid={Boolean(errors.confirm)}
            onChange={(e) => set('confirm')(e.target.value)}
          />
        </Field>
        <Button type="submit" size="lg" loading={busy}>
          {busy ? 'Mendaftarkan...' : 'Daftar'}
        </Button>
      </form>

      <p className="mt-5 text-sm text-muted">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-semibold text-primary underline-offset-2 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}
