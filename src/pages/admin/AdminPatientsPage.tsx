import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  INITIAL_PATIENTS,
  type PatientItem,
} from '@/mock/patients'
import { cn } from '@/lib/cn'

// Toast notification model
interface ToastInfo {
  id: number
  type: 'success' | 'info' | 'danger'
  message: string
}

export default function AdminPatientsPage() {
  const navigate = useNavigate()

  // State data pasien (diinisialisasi dari INITIAL_PATIENTS)
  const [patients, setPatients] = useState<PatientItem[]>(() => {
    const saved = sessionStorage.getItem('mc_admin_patients_state')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return INITIAL_PATIENTS
      }
    }
    return INITIAL_PATIENTS
  })

  // Simpan ke sessionStorage saat state berubah
  const updatePatientsState = (newPatients: PatientItem[]) => {
    setPatients(newPatients)
    try {
      sessionStorage.setItem('mc_admin_patients_state', JSON.stringify(newPatients))
    } catch {
      // ignore
    }
  }

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastInfo[]>([])
  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }

  // Search & Filters
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<'Semua' | 'Laki-laki' | 'Perempuan'>('Semua')
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Nonaktif'>('Semua')

  // Pagination (8 item per halaman sesuai mockup gambar referensi)
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Selected patient for Right Detail Panel (default ke item #1: Aisyah Putri)
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(() => {
    return INITIAL_PATIENTS[0] || null
  })

  // Active Tab in Detail Panel: 0 = Profil, 1 = Riwayat Skrining, 2 = Kartu RFID
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isRfidModalOpen, setIsRfidModalOpen] = useState(false)
  const [patientToToggle, setPatientToToggle] = useState<PatientItem | null>(null)

  // Form state untuk Tambah Pasien
  const [addForm, setAddForm] = useState({
    nama: '',
    tanggalLahir: '',
    jenisKelamin: 'Perempuan' as 'Laki-laki' | 'Perempuan',
    nik: '',
    alamat: '',
    noTelepon: '',
    uidRfid: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  })
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  // Form state untuk Edit Pasien
  const [editForm, setEditForm] = useState({
    nama: '',
    tanggalLahir: '',
    jenisKelamin: 'Perempuan' as 'Laki-laki' | 'Perempuan',
    nik: '',
    alamat: '',
    noTelepon: '',
    uidRfid: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // Input state untuk modal Hubungkan RFID
  const [rfidInput, setRfidInput] = useState('')
  const [rfidError, setRfidError] = useState('')

  // State file simulasi untuk modal Import
  const [importFileName, setImportFileName] = useState<string | null>(null)
  const [importPreviewCount, setImportPreviewCount] = useState<number>(0)

  // Filtered patients calculation
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (genderFilter !== 'Semua' && p.jenisKelamin !== genderFilter) return false
      if (statusFilter !== 'Semua' && p.status !== statusFilter) return false
      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchName = p.nama.toLowerCase().includes(query)
        const matchId = p.idPasien.toLowerCase().includes(query)
        const matchRfid = p.uidRfid?.toLowerCase().includes(query) ?? false
        const matchNik = p.nik.includes(query)
        if (!matchName && !matchId && !matchRfid && !matchNik) return false
      }
      return true
    })
  }, [patients, search, genderFilter, statusFilter])

  // Pagination calculation
  const baseTotalPatients = 1248 // Angka representatif dashboard (1.248)
  const totalItems = filteredPatients.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedPatients = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredPatients.slice(start, start + pageSize)
  }, [filteredPatients, page, pageSize])

  // Reset Filters
  const handleResetFilter = () => {
    setSearch('')
    setGenderFilter('Semua')
    setStatusFilter('Semua')
    setPage(1)
    showToast('Filter pencarian pasien telah direset', 'info')
  }

  // Open Modal Tambah Pasien
  const openAddModal = () => {
    setAddForm({
      nama: '',
      tanggalLahir: '',
      jenisKelamin: 'Perempuan',
      nik: '',
      alamat: '',
      noTelepon: '',
      uidRfid: '',
      status: 'Aktif',
    })
    setAddErrors({})
    setIsAddModalOpen(true)
  }

  // Submit Tambah Pasien
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (!addForm.nama.trim()) errs.nama = 'Nama lengkap wajib diisi.'
    if (!addForm.tanggalLahir) {
      errs.tanggalLahir = 'Tanggal lahir wajib diisi.'
    } else {
      const birthDate = new Date(addForm.tanggalLahir)
      if (birthDate > new Date()) {
        errs.tanggalLahir = 'Tanggal lahir tidak boleh di masa depan.'
      }
    }
    if (addForm.nik.trim() && !/^\d{16}$/.test(addForm.nik.trim())) {
      errs.nik = 'Format NIK harus 16 digit angka jika diisi.'
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs)
      return
    }

    // Hitung umur dari tanggal lahir
    const birthYear = new Date(addForm.tanggalLahir).getFullYear()
    const age = Math.max(1, 2026 - birthYear)
    const formattedBirthDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(addForm.tanggalLahir))

    const newIdPasien = `P-${String(3174 + patients.length + 1).padStart(5, '0')}`

    const newPatient: PatientItem = {
      id: String(Date.now()),
      idPasien: newIdPasien,
      nama: addForm.nama.trim(),
      usia: `${age} th`,
      umurTahun: age,
      tanggalLahir: formattedBirthDate,
      jenisKelamin: addForm.jenisKelamin,
      nik: addForm.nik.trim() || '320101' + Math.floor(1000000000 + Math.random() * 9000000000),
      uidRfid: addForm.uidRfid.trim() ? addForm.uidRfid.trim().toUpperCase() : null,
      alamat: addForm.alamat.trim() || 'Kota Bandung',
      noTelepon: addForm.noTelepon.trim() || '-',
      terakhirSkrining: null,
      status: addForm.status,
      riwayatSkrining: [],
    }

    const updated = [newPatient, ...patients]
    updatePatientsState(updated)
    setSelectedPatient(newPatient)
    setIsAddModalOpen(false)
    showToast(`Pasien baru "${newPatient.nama}" (${newPatient.idPasien}) berhasil didaftarkan!`)
  }

  // Open Modal Edit Pasien
  const openEditModal = (patient: PatientItem) => {
    setSelectedPatient(patient)
    setEditForm({
      nama: patient.nama,
      tanggalLahir: patient.tanggalLahir,
      jenisKelamin: patient.jenisKelamin,
      nik: patient.nik,
      alamat: patient.alamat,
      noTelepon: patient.noTelepon,
      uidRfid: patient.uidRfid || '',
      status: patient.status,
    })
    setEditErrors({})
    setIsEditModalOpen(true)
  }

  // Submit Edit Pasien
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    const errs: Record<string, string> = {}
    if (!editForm.nama.trim()) errs.nama = 'Nama lengkap wajib diisi.'
    if (editForm.nik.trim() && !/^\d{16}$/.test(editForm.nik.trim())) {
      errs.nik = 'Format NIK harus 16 digit angka jika diisi.'
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs)
      return
    }

    const updatedPatient: PatientItem = {
      ...selectedPatient,
      nama: editForm.nama.trim(),
      jenisKelamin: editForm.jenisKelamin,
      nik: editForm.nik.trim() || selectedPatient.nik,
      alamat: editForm.alamat.trim() || selectedPatient.alamat,
      noTelepon: editForm.noTelepon.trim() || selectedPatient.noTelepon,
      uidRfid: editForm.uidRfid.trim() ? editForm.uidRfid.trim().toUpperCase() : null,
      status: editForm.status,
    }

    const updatedList = patients.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    updatePatientsState(updatedList)
    setSelectedPatient(updatedPatient)
    setIsEditModalOpen(false)
    showToast(`Data pasien "${updatedPatient.nama}" berhasil diperbarui!`)
  }

  // Toggle Status Aktif / Nonaktif
  const handleToggleStatus = (patient: PatientItem) => {
    const nextStatus: 'Aktif' | 'Nonaktif' = patient.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
    const updated = patients.map((p) =>
      p.id === patient.id ? { ...p, status: nextStatus } : p,
    )
    updatePatientsState(updated)
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient({ ...selectedPatient, status: nextStatus })
    }
    setPatientToToggle(null)
    showToast(
      `Status pasien "${patient.nama}" diubah menjadi ${nextStatus}. Riwayat skrining tetap tersimpan aman.`,
      nextStatus === 'Aktif' ? 'success' : 'info',
    )
  }

  // Hubungkan Kartu RFID
  const handleConnectRfid = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    if (!rfidInput.trim()) {
      setRfidError('Nomor UID RFID wajib diisi.')
      return
    }

    const cleanUid = rfidInput.trim().toUpperCase()
    const updatedPatient: PatientItem = {
      ...selectedPatient,
      uidRfid: cleanUid.startsWith('RFID-') ? cleanUid : `RFID-${cleanUid}`,
    }

    const updatedList = patients.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    updatePatientsState(updatedList)
    setSelectedPatient(updatedPatient)
    setIsRfidModalOpen(false)
    setRfidInput('')
    setRfidError('')
    showToast(`Kartu RFID "${updatedPatient.uidRfid}" berhasil dihubungkan ke pasien!`)
  }

  // Lepaskan Kartu RFID
  const handleDisconnectRfid = () => {
    if (!selectedPatient) return
    const updatedPatient: PatientItem = {
      ...selectedPatient,
      uidRfid: null,
    }
    const updatedList = patients.map((p) => (p.id === selectedPatient.id ? updatedPatient : p))
    updatePatientsState(updatedList)
    setSelectedPatient(updatedPatient)
    showToast(`Kartu RFID berhasil dilepaskan dari pasien ${selectedPatient.nama}.`, 'info')
  }

  // Simulasi Import CSV/Excel
  const handleSimulateImport = () => {
    const sampleImportedPatients: PatientItem[] = [
      {
        id: String(Date.now() + 1),
        idPasien: 'P-03175',
        nama: 'Ghani Alamsyah',
        usia: '8 th',
        umurTahun: 8,
        tanggalLahir: '14 Feb 2018',
        jenisKelamin: 'Laki-laki',
        nik: '3201018802180004',
        uidRfid: 'RFID-11C4D9A2',
        alamat: 'Jl. Tubagus Ismail No. 20, Bandung',
        noTelepon: '0812-4455-6677',
        terakhirSkrining: null,
        status: 'Aktif',
        riwayatSkrining: [],
      },
      {
        id: String(Date.now() + 2),
        idPasien: 'P-03176',
        nama: 'Syifa Azzahra',
        usia: '7 th',
        umurTahun: 7,
        tanggalLahir: '20 Mei 2019',
        jenisKelamin: 'Perempuan',
        nik: '3201026005190001',
        uidRfid: null,
        alamat: 'Jl. Dipatiukur No. 45, Bandung',
        noTelepon: '0857-8899-0011',
        terakhirSkrining: null,
        status: 'Aktif',
        riwayatSkrining: [],
      },
    ]

    const updated = [...sampleImportedPatients, ...patients]
    updatePatientsState(updated)
    setSelectedPatient(sampleImportedPatients[0])
    setIsImportModalOpen(false)
    setImportFileName(null)
    setImportPreviewCount(0)
    showToast(`Berhasil mengimpor 2 data pasien baru ke dalam sistem!`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Alert Popups */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all animate-in slide-in-from-bottom-2',
              toast.type === 'success' && 'bg-emerald-600 text-white',
              toast.type === 'info' && 'bg-blue-600 text-white',
              toast.type === 'danger' && 'bg-rose-600 text-white',
            )}
          >
            <span>
              {toast.type === 'success' && '✓'}
              {toast.type === 'info' && 'ℹ'}
              {toast.type === 'danger' && '✕'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header Halaman & Breadcrumb */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
          <Link to="/admin" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-text">Manajemen Pasien</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
          Manajemen Pasien
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola data pasien dan kartu RFID untuk penggunaan skrining.
        </p>
      </div>

      {/* 4 Kartu Statistik (Persis seperti di gambar referensi) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Kartu 1: Total Pasien */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-action/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Total Pasien
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                ↑ +12
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">1.248</p>
            <p className="mt-1 text-xs text-muted">terdaftar di sistem</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M3 19c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" />
              <path d="M16 11a3 3 0 1 0-1.2-5.5M17.5 19c-.3-1.8-1.2-3.2-2.5-4" />
            </svg>
          </div>
        </div>

        {/* Kartu 2: Pasien Baru (Bulan Ini) */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-purple-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Pasien Baru (Bulan Ini)
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                ↑ +8
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">48</p>
            <p className="mt-1 text-xs text-muted">dibanding bulan lalu</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          </div>
        </div>

        {/* Kartu 3: Pernah Skrining */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-emerald-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Pernah Skrining
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                79,0%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">986</p>
            <p className="mt-1 text-xs text-muted">dari total pasien</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-6">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect width="8" height="4" x="8" y="2" rx="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Kartu 4: Kartu RFID Aktif */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-cyan-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Kartu RFID Aktif
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                88,3%
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">1.102</p>
            <p className="mt-1 text-xs text-muted">dari total pasien</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Daftar Pasien (Kiri) + Panel Detail Pasien (Kanan) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Tabel (8 kolom jika detail buka, 12 jika tutup) */}
        <div className={cn(selectedPatient ? 'lg:col-span-8' : 'lg:col-span-12', 'transition-all duration-200')}>
          <div className="rounded-2xl border border-border-soft bg-surface shadow-card overflow-hidden">
            {/* Header Card Tabel */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-soft px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                    <circle cx="9" cy="8" r="3.5" />
                    <path d="M3 19c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" />
                    <path d="M16 11a3 3 0 1 0-1.2-5.5M17.5 19c-.3-1.8-1.2-3.2-2.5-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">Daftar Pasien</h2>
                  <p className="text-xs text-muted">
                    Total {totalItems} data pasien ditemukan
                  </p>
                </div>
              </div>

              {/* Action Buttons: Import Data & Tambah Pasien */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-soft bg-surface px-3.5 py-2 text-xs font-semibold text-text shadow-xs transition hover:border-action hover:text-action hover:bg-blue-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                  <span>Import Data</span>
                </button>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-action-hover"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Tambah Pasien</span>
                </button>
              </div>
            </div>

            {/* Filter Toolbar & Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border-soft bg-surface-muted/50 p-4">
              {/* Search Bar */}
              <div className="relative min-w-[200px] flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Cari pasien (nama, ID, atau UID RFID)..."
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface pl-9 pr-3 text-xs text-text placeholder:text-muted transition focus-visible:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Jenis Kelamin */}
              <div className="w-auto">
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    setGenderFilter(e.target.value as 'Semua' | 'Laki-laki' | 'Perempuan')
                    setPage(1)
                  }}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-3 pr-8 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Semua">Semua Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Filter Status */}
              <div className="w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as 'Semua' | 'Aktif' | 'Nonaktif')
                    setPage(1)
                  }}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-3 pr-8 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* Tombol Reset */}
              {(search || genderFilter !== 'Semua' || statusFilter !== 'Semua') && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border-soft bg-surface px-3 text-xs font-semibold text-muted transition hover:border-action hover:text-action"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-muted/70 text-xs font-bold uppercase tracking-wider text-muted">
                    <th className="w-12 px-4 py-3.5 text-center">No</th>
                    <th className="px-4 py-3.5">ID Pasien</th>
                    <th className="px-4 py-3.5">Nama</th>
                    <th className="px-4 py-3.5">Usia</th>
                    <th className="px-4 py-3.5">Jenis Kelamin</th>
                    <th className="px-4 py-3.5">UID RFID</th>
                    <th className="px-4 py-3.5">Terakhir Skrining</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="w-24 px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-muted">
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                          <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                            🔍
                          </span>
                          <p className="text-sm font-semibold text-text">Tidak ada data pasien yang cocok</p>
                          <p className="text-xs text-muted">
                            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan semua data.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetFilter}
                            className="mt-2 text-xs font-semibold text-action underline-offset-2 hover:underline"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map((p, idx) => {
                      const rowNumber = (page - 1) * pageSize + idx + 1
                      const isSelected = selectedPatient?.id === p.id

                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedPatient(p)}
                          className={cn(
                            'group cursor-pointer transition-colors duration-150',
                            isSelected
                              ? 'bg-blue-50/70 hover:bg-blue-50'
                              : 'hover:bg-slate-50/80',
                          )}
                        >
                          {/* No */}
                          <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500 tabular">
                            {rowNumber}
                          </td>

                          {/* ID Pasien */}
                          <td className="px-4 py-3.5">
                            <span className="font-semibold tabular text-xs text-slate-800">
                              {p.idPasien}
                            </span>
                          </td>

                          {/* Nama */}
                          <td className="px-4 py-3.5">
                            <p className="text-xs font-semibold text-text group-hover:text-action">
                              {p.nama}
                            </p>
                          </td>

                          {/* Usia */}
                          <td className="px-4 py-3.5 tabular text-xs text-slate-600">
                            {p.usia}
                          </td>

                          {/* Jenis Kelamin Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {p.jenisKelamin === 'Perempuan' ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
                                <span>♀</span>
                                <span>Perempuan</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                                <span>♂</span>
                                <span>Laki-laki</span>
                              </span>
                            )}
                          </td>

                          {/* UID RFID Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {p.uidRfid ? (
                              <span className="inline-flex items-center rounded-md border border-cyan-200 bg-cyan-50/70 px-2 py-0.5 text-xs font-medium tabular text-cyan-800">
                                {p.uidRfid}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">-</span>
                            )}
                          </td>

                          {/* Terakhir Skrining */}
                          <td className="px-4 py-3.5 tabular text-xs text-slate-600 whitespace-nowrap">
                            {p.terakhirSkrining || '-'}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            {p.status === 'Aktif' ? (
                              <span className="text-xs font-medium text-emerald-700">
                                Aktif
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-500">
                                Nonaktif
                              </span>
                            )}
                          </td>

                          {/* Tombol Aksi */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {/* Lihat Detail */}
                              <button
                                type="button"
                                title="Lihat detail pasien"
                                onClick={() => setSelectedPatient(p)}
                                className={cn(
                                  'grid size-7 place-items-center rounded-lg border transition-colors',
                                  isSelected
                                    ? 'border-action bg-action text-white'
                                    : 'border-border-soft bg-surface text-action hover:bg-action-soft hover:border-action',
                                )}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>

                              {/* Edit Data */}
                              <button
                                type="button"
                                title="Edit data pasien"
                                onClick={() => openEditModal(p)}
                                className="grid size-7 place-items-center rounded-lg border border-border-soft bg-surface text-indigo-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                                  <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                                  <path d="m14.5 7.5 2.5 2.5" />
                                </svg>
                              </button>

                              {/* Nonaktifkan / Aktifkan Toggle */}
                              <button
                                type="button"
                                title={p.status === 'Aktif' ? 'Nonaktifkan pasien' : 'Aktifkan kembali pasien'}
                                onClick={() => setPatientToToggle(p)}
                                className="grid size-7 place-items-center rounded-lg border border-border-soft bg-surface text-rose-600 transition-colors hover:border-rose-400 hover:bg-rose-50"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-5 py-3.5">
              <p className="tabular text-xs text-muted">
                Menampilkan{' '}
                <span className="font-semibold text-text">
                  {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>{' '}
                –{' '}
                <span className="font-semibold text-text">
                  {Math.min(page * pageSize, totalItems)}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-text">
                  {search || genderFilter !== 'Semua' || statusFilter !== 'Semua'
                    ? `${totalItems} hasil`
                    : `${baseTotalPatients.toLocaleString('id-ID')} pasien`}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-xs font-semibold text-muted transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={cn(
                      'grid size-8 place-items-center rounded-lg border text-xs font-semibold transition',
                      page === num
                        ? 'border-action bg-action text-white shadow-2xs'
                        : 'border-border-soft bg-surface text-muted hover:border-action hover:text-action',
                    )}
                  >
                    {num}
                  </button>
                ))}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-xs text-muted">...</span>
                    <button
                      type="button"
                      onClick={() => setPage(156)}
                      className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-xs font-semibold text-muted hover:border-action hover:text-action"
                    >
                      156
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-xs font-semibold text-muted transition hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Panel Detail Pasien (Persis seperti mockup screenshot) */}
        {selectedPatient ? (
          <div className="lg:col-span-4">
            <div className="sticky top-20 rounded-2xl border border-border-soft bg-surface p-5 shadow-card">
              {/* Header Detail */}
              <div className="flex items-center justify-between border-b border-border-soft pb-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-blue-50 text-action">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-text">Detail Pasien</h3>
                </div>

                <button
                  type="button"
                  title="Tutup panel detail"
                  onClick={() => setSelectedPatient(null)}
                  className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Profile Card Box (Avatar, Nama, ID, Status) */}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface-muted/40 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-blue-100 text-action font-bold text-base">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text">{selectedPatient.nama}</h4>
                    <p className="tabular text-xs font-semibold text-muted">{selectedPatient.idPasien}</p>
                  </div>
                </div>

                <div>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      selectedPatient.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200',
                    )}
                  >
                    {selectedPatient.status}
                  </span>
                </div>
              </div>

              {/* Tab Navigation: Profil, Riwayat Skrining, Kartu RFID */}
              <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab(0)}
                  className={cn(
                    'flex-1 rounded-lg py-2 font-semibold transition',
                    activeTab === 0
                      ? 'bg-action text-white shadow-xs'
                      : 'text-slate-600 hover:text-text',
                  )}
                >
                  Profil
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className={cn(
                    'flex-1 rounded-lg py-2 font-semibold transition',
                    activeTab === 1
                      ? 'bg-action text-white shadow-xs'
                      : 'text-slate-600 hover:text-text',
                  )}
                >
                  Riwayat Skrining
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className={cn(
                    'flex-1 rounded-lg py-2 font-semibold transition',
                    activeTab === 2
                      ? 'bg-action text-white shadow-xs'
                      : 'text-slate-600 hover:text-text',
                  )}
                >
                  Kartu RFID
                </button>
              </div>

              {/* Tab 0 Content: Profil & Ringkasan Skrining Box */}
              {activeTab === 0 && (
                <div className="mt-4 space-y-4">
                  {/* Daftar Data Profil */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="grid size-5 shrink-0 place-items-center text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                      </span>
                      <span className="w-24 text-muted">Tanggal Lahir</span>
                      <span className="text-muted">:</span>
                      <span className="font-semibold text-text">
                        {selectedPatient.tanggalLahir} ({selectedPatient.umurTahun} tahun)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="grid size-5 shrink-0 place-items-center text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                      </span>
                      <span className="w-24 text-muted">Jenis Kelamin</span>
                      <span className="text-muted">:</span>
                      <span className="font-semibold text-text">{selectedPatient.jenisKelamin}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="grid size-5 shrink-0 place-items-center text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </span>
                      <span className="w-24 text-muted">UID RFID</span>
                      <span className="text-muted">:</span>
                      <span className="font-semibold tabular text-cyan-800">
                        {selectedPatient.uidRfid || '-'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="grid size-5 shrink-0 place-items-center text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </span>
                      <span className="w-24 text-muted">Alamat</span>
                      <span className="text-muted">:</span>
                      <span className="font-medium text-text truncate">{selectedPatient.alamat}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="grid size-5 shrink-0 place-items-center text-muted">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </span>
                      <span className="w-24 text-muted">No. Telepon</span>
                      <span className="text-muted">:</span>
                      <span className="font-semibold tabular text-text">{selectedPatient.noTelepon}</span>
                    </div>
                  </div>

                  {/* Ringkasan Skrining Box (Persis sesuai screenshot acuan) */}
                  <div className="rounded-xl border border-border-soft bg-surface-muted/40 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-text mb-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 text-action">
                        <path d="M18 20V10M12 20V4M6 20v-6" />
                      </svg>
                      <span>Ringkasan Skrining</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-blue-100 bg-white p-2.5 shadow-2xs">
                        <p className="text-xl font-bold text-action tabular">
                          {selectedPatient.riwayatSkrining.length}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-slate-500">
                          Total Skrining
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 shadow-2xs">
                        <p className="text-xl font-bold text-amber-700 tabular">
                          {
                            selectedPatient.riwayatSkrining.filter(
                              (s) => s.hasil === 'Mengarah ke Suspek',
                            ).length
                          }
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-amber-800">
                          Mengarah ke Suspek
                        </p>
                      </div>

                      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 shadow-2xs">
                        <p className="text-xl font-bold text-rose-700 tabular">
                          {
                            selectedPatient.riwayatSkrining.filter(
                              (s) => s.hasil === 'Perlu Penanganan Segera',
                            ).length
                          }
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-rose-800">
                          Perlu Penanganan Segera
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons di bawah profil */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-soft">
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedPatient)}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-action bg-white px-3 py-2 text-xs font-semibold text-action transition hover:bg-action-soft"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                        <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                        <path d="m14.5 7.5 2.5 2.5" />
                      </svg>
                      <span>Ubah Pasien</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPatientToToggle(selectedPatient)}
                      className={cn(
                        'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                        selectedPatient.status === 'Aktif'
                          ? 'border-rose-300 bg-rose-50/50 text-rose-600 hover:bg-rose-100'
                          : 'border-emerald-300 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100',
                      )}
                    >
                      <span>
                        {selectedPatient.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 1 Content: Riwayat Skrining */}
              {activeTab === 1 && (
                <div className="mt-4 space-y-3 text-xs">
                  {selectedPatient.riwayatSkrining.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border-soft p-6 text-center text-muted">
                      <p className="font-semibold text-text">Belum ada riwayat skrining</p>
                      <p className="text-[11px] mt-1">
                        Pasien ini belum pernah melakukan pemeriksaan di kiosk MeaslesCare.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {selectedPatient.riwayatSkrining.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-border-soft bg-surface p-3 transition hover:border-action"
                        >
                          <div>
                            <p className="font-semibold tabular text-text">{item.waktu}</p>
                            <p className="text-[11px] text-muted">
                              Suhu: <span className="tabular font-medium text-slate-800">{item.suhu.toFixed(1).replace('.', ',')} °C</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mb-1',
                                item.hasil === 'Perlu Penanganan Segera'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : item.hasil === 'Mengarah ke Suspek'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                              )}
                            >
                              {item.hasil}
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => navigate('/admin/skrining')}
                                className="text-[11px] font-semibold text-action underline-offset-2 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Buka Skrining</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2 Content: Kartu RFID */}
              {activeTab === 2 && (
                <div className="mt-4 space-y-4 text-xs">
                  <div className="rounded-xl border border-border-soft bg-surface-muted/60 p-4">
                    <p className="font-bold text-text mb-2">Status Identifikasi RFID</p>
                    {selectedPatient.uidRfid ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Status:</span>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                            Terhubung
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Nomor UID:</span>
                          <span className="font-bold tabular text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                            {selectedPatient.uidRfid}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted leading-relaxed">
                        Pasien belum memiliki kartu RFID yang terhubung.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-blue-50/70 p-3 text-[11px] text-slate-700 leading-relaxed border border-blue-200">
                    💡 <strong>Catatan:</strong> Kartu RFID hanya digunakan untuk mempercepat tap identitas saat tiba di kiosk. Pasien tetap dapat melakukan skrining mandiri menggunakan input ID atau NIK manual jika tidak membawa kartu RFID.
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border-soft">
                    {selectedPatient.uidRfid ? (
                      <button
                        type="button"
                        onClick={handleDisconnectRfid}
                        className="w-full min-h-10 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition"
                      >
                        Lepaskan Kartu RFID
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRfidInput('')
                          setRfidError('')
                          setIsRfidModalOpen(true)
                        }}
                        className="w-full min-h-10 rounded-xl bg-action text-white font-semibold text-xs hover:bg-action-hover shadow-sm transition"
                      >
                        + Hubungkan Kartu RFID Baru
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-dashed border-border-soft bg-surface p-8 text-center shadow-card">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-action">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-bold text-text">Pilih Pasien</h3>
              <p className="mt-1 text-xs text-muted">
                Klik salah satu baris pada tabel atau tombol mata 👁️ untuk melihat detail profil, riwayat skrining, dan kartu RFID.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: Tambah Pasien Baru
      ======================================================== */}
      {isAddModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h3 className="text-base font-bold text-text">Tambah Pasien Baru</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Daftarkan pasien ke database skrining awal MeaslesCare.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} noValidate className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-text">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.nama}
                  onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                  placeholder="Contoh: Aisyah Putri"
                  className={cn(
                    'mt-1 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                    addErrors.nama
                      ? 'border-rose-400 focus-visible:ring-rose-200'
                      : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                  )}
                />
                {addErrors.nama && <p className="mt-1 text-xs text-rose-600">{addErrors.nama}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text">
                    Tanggal Lahir <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={addForm.tanggalLahir}
                    onChange={(e) => setAddForm({ ...addForm, tanggalLahir: e.target.value })}
                    className={cn(
                      'mt-1 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.tanggalLahir
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.tanggalLahir && (
                    <p className="mt-1 text-xs text-rose-600">{addErrors.tanggalLahir}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">Jenis Kelamin</label>
                  <select
                    value={addForm.jenisKelamin}
                    onChange={(e) =>
                      setAddForm({ ...addForm, jenisKelamin: e.target.value as 'Laki-laki' | 'Perempuan' })
                    }
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text">
                    NIK (Opsional, 16 digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={addForm.nik}
                    onChange={(e) => setAddForm({ ...addForm, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="320101xxxxxxxxxx"
                    className={cn(
                      'mt-1 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs tabular text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.nik
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.nik && <p className="mt-1 text-xs text-rose-600">{addErrors.nik}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={addForm.noTelepon}
                    onChange={(e) => setAddForm({ ...addForm, noTelepon: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text">Alamat Tinggal</label>
                <input
                  type="text"
                  value={addForm.alamat}
                  onChange={(e) => setAddForm({ ...addForm, alamat: e.target.value })}
                  placeholder="Jl. Sukaraja No. 24, Bandung"
                  className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text">UID Kartu RFID (Opsional)</label>
                  <input
                    type="text"
                    value={addForm.uidRfid}
                    onChange={(e) => setAddForm({ ...addForm, uidRfid: e.target.value })}
                    placeholder="RFID-8F3A2C1D"
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">Status Awal Pasien</label>
                  <select
                    value={addForm.status}
                    onChange={(e) =>
                      setAddForm({ ...addForm, status: e.target.value as 'Aktif' | 'Nonaktif' })
                    }
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border-soft pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-action px-5 text-xs font-semibold text-white shadow-sm hover:bg-action-hover"
                >
                  Simpan Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: Edit Pasien
      ======================================================== */}
      {isEditModalOpen && selectedPatient && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h3 className="text-base font-bold text-text">Edit Data Pasien</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Perbarui identitas pasien {selectedPatient.nama} ({selectedPatient.idPasien}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} noValidate className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-text">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className={cn(
                    'mt-1 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none',
                    editErrors.nama ? 'border-rose-400' : 'border-border-soft focus-visible:border-action',
                  )}
                />
                {editErrors.nama && <p className="mt-1 text-xs text-rose-600">{editErrors.nama}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text">Jenis Kelamin</label>
                  <select
                    value={editForm.jenisKelamin}
                    onChange={(e) =>
                      setEditForm({ ...editForm, jenisKelamin: e.target.value as 'Laki-laki' | 'Perempuan' })
                    }
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">NIK</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={editForm.nik}
                    onChange={(e) => setEditForm({ ...editForm, nik: e.target.value.replace(/\D/g, '') })}
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs tabular text-text focus-visible:border-action focus-visible:outline-none"
                  />
                  {editErrors.nik && <p className="mt-1 text-xs text-rose-600">{editErrors.nik}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={editForm.noTelepon}
                    onChange={(e) => setEditForm({ ...editForm, noTelepon: e.target.value })}
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">UID Kartu RFID</label>
                  <input
                    type="text"
                    value={editForm.uidRfid}
                    onChange={(e) => setEditForm({ ...editForm, uidRfid: e.target.value })}
                    placeholder="Kosongkan bila belum ada"
                    className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text">Alamat</label>
                <input
                  type="text"
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text">Status Pasien</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value as 'Aktif' | 'Nonaktif' })
                  }
                  className="mt-1 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs text-text focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border-soft pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-action px-5 text-xs font-semibold text-white shadow-sm hover:bg-action-hover"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: Import Data Pasien (CSV / Excel)
      ======================================================== */}
      {isImportModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h3 className="text-base font-bold text-text">Import Data Pasien</h3>
                <p className="mt-0.5 text-xs text-muted">
                  Unggah berkas CSV atau Excel berisi daftar pasien fasyankes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Dropzone Upload */}
              <div
                onClick={() => {
                  setImportFileName('data-pasien-puskesmas-november.csv')
                  setImportPreviewCount(2)
                }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-soft bg-surface-muted/60 p-6 text-center cursor-pointer hover:border-action transition"
              >
                <div className="grid size-12 place-items-center rounded-full bg-blue-50 text-action mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-text">
                  {importFileName ? importFileName : 'Klik atau seret berkas ke sini'}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Mendukung format .CSV dan .XLSX (Maksimal 5MB)
                </p>
                {importFileName && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                    ✓ Berkas terpilih ({importPreviewCount} baris data valid)
                  </span>
                )}
              </div>

              {/* Format Kolom Guide */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5">
                <p className="font-bold text-slate-800">Petunjuk Format Kolom Spreadsheet:</p>
                <p className="text-slate-600 font-mono text-[11px]">
                  Nama, Tanggal_Lahir, Jenis_Kelamin, NIK, Alamat, No_Telepon, UID_RFID
                </p>
                <p className="text-[11px] text-muted">
                  * Kolom UID_RFID bersifat opsional. Pasien tanpa RFID tetap dapat diimpor.
                </p>
              </div>

              {/* Preview data */}
              {importFileName && (
                <div className="rounded-xl border border-border-soft bg-surface p-3 text-xs">
                  <p className="font-bold text-text mb-2">Pratinjau Data Sebelum Import:</p>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <p>1. Ghani Alamsyah · Laki-laki · RFID-11C4D9A2</p>
                    <p>2. Syifa Azzahra · Perempuan · (Tanpa RFID)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-border-soft pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!importFileName}
                onClick={handleSimulateImport}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-action px-5 text-xs font-semibold text-white shadow-sm hover:bg-action-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mulai Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: Hubungkan Kartu RFID Baru
      ======================================================== */}
      {isRfidModalOpen && selectedPatient && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsRfidModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <h3 className="text-base font-bold text-text">Hubungkan Kartu RFID</h3>
            <p className="mt-1 text-xs text-muted">
              Pasien: <span className="font-semibold text-text">{selectedPatient.nama}</span>
            </p>

            <form onSubmit={handleConnectRfid} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-text mb-1">
                  Nomor UID Kartu RFID
                </label>
                <input
                  type="text"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="Contoh: RFID-8F3A2C1D"
                  className="min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs font-semibold uppercase text-text focus-visible:border-action focus-visible:outline-none"
                />
                {rfidError && <p className="mt-1 text-xs text-rose-600">{rfidError}</p>}
                <p className="mt-1.5 text-[11px] text-muted">
                  Tap kartu pada reader kiosk atau ketik nomor UID kartu fisik.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-border-soft pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsRfidModalOpen(false)}
                  className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-9 rounded-xl bg-action px-4 text-xs font-semibold text-white shadow-sm hover:bg-action-hover"
                >
                  Simpan Kartu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: Konfirmasi Nonaktifkan / Aktifkan Pasien
      ======================================================== */}
      {patientToToggle && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setPatientToToggle(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-2xl',
                  patientToToggle.status === 'Aktif'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-emerald-50 text-emerald-600',
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" x2="12" y1="2" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-text">
                  {patientToToggle.status === 'Aktif'
                    ? 'Nonaktifkan Pasien Ini?'
                    : 'Aktifkan Kembali Pasien Ini?'}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {patientToToggle.status === 'Aktif'
                    ? `Pasien "${patientToToggle.nama}" (${patientToToggle.idPasien}) akan berstatus nonaktif. Riwayat skrining sebelumnya tetap tersimpan aman di database.`
                    : `Pasien "${patientToToggle.nama}" (${patientToToggle.idPasien}) akan diaktifkan kembali dan dapat melakukan skrining di kiosk.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => setPatientToToggle(null)}
                className="min-h-9 rounded-xl border border-border-soft px-4 text-xs font-semibold text-muted hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(patientToToggle)}
                className={cn(
                  'min-h-9 rounded-xl px-4 text-xs font-semibold text-white shadow-sm transition',
                  patientToToggle.status === 'Aktif'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700',
                )}
              >
                {patientToToggle.status === 'Aktif' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
