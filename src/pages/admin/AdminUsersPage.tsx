import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  INITIAL_USERS,
  type AdminUserRole,
  type AdminUserStatus,
  type UserAccount,
} from '@/mock/users'
import { cn } from '@/lib/cn'

// Helper avatar color based on name
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((n) => !n.startsWith('Dr.') && !n.startsWith('dr.'))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || name.slice(0, 2).toUpperCase()
}

// Toast notification model
interface ToastInfo {
  id: number
  type: 'success' | 'info' | 'danger'
  message: string
}

export default function AdminUsersPage() {
  // State users (diinisialisasi dari INITIAL_USERS mock)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = sessionStorage.getItem('mc_admin_users_state')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return INITIAL_USERS
      }
    }
    return INITIAL_USERS
  })

  // Simpan ke sessionStorage saat state berubah
  const updateUsersState = (newUsers: UserAccount[]) => {
    setUsers(newUsers)
    try {
      sessionStorage.setItem('mc_admin_users_state', JSON.stringify(newUsers))
    } catch {
      // ignore
    }
  }

  // State toast alert
  const [toasts, setToasts] = useState<ToastInfo[]>([])
  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }

  // Filter & Search states
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'Semua' | AdminUserRole>('Semua')
  const [statusFilter, setStatusFilter] = useState<'Semua' | AdminUserStatus>('Semua')

  // Pagination state (8 baris per halaman sesuai screenshot referensi)
  const [page, setPage] = useState(1)
  const pageSize = 8

  // Selected user for Detail Panel (default Dr. Riska Maharani jika ada, atau user ke-2)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(() => {
    return INITIAL_USERS.find((u) => u.username === 'dr.riska') || INITIAL_USERS[0] || null
  })

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<UserAccount | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null)

  // Form states untuk Tambah Pengguna
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    nik: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Petugas Kesehatan' as AdminUserRole,
    status: 'Aktif' as AdminUserStatus,
  })
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  // Form states untuk Edit Pengguna
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    nik: '',
    email: '',
    phone: '',
    role: 'Petugas Kesehatan' as AdminUserRole,
    status: 'Aktif' as AdminUserStatus,
    changePassword: false,
    newPassword: '',
    confirmNewPassword: '',
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'Semua' && u.role !== roleFilter) return false
      // Status filter
      if (statusFilter !== 'Semua' && u.status !== statusFilter) return false
      // Search term
      if (search.trim()) {
        const query = search.toLowerCase().trim()
        const matchName = u.name.toLowerCase().includes(query)
        const matchUsername = u.username.toLowerCase().includes(query)
        const matchNik = u.nik.includes(query)
        const matchEmail = u.email.toLowerCase().includes(query)
        if (!matchName && !matchUsername && !matchNik && !matchEmail) return false
      }
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  // Pagination calculation
  const totalItems = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, page, pageSize])

  // Statistics calculation
  const totalCount = users.length
  const adminCount = users.filter((u) => u.role === 'Admin').length
  const petugasCount = users.filter((u) => u.role === 'Petugas Kesehatan').length
  const activeCount = users.filter((u) => u.status === 'Aktif').length
  const inactiveCount = users.filter((u) => u.status === 'Nonaktif').length

  // Handlers
  const handleResetFilter = () => {
    setSearch('')
    setRoleFilter('Semua')
    setStatusFilter('Semua')
    setPage(1)
    showToast('Filter pencarian telah direset', 'info')
  }

  // Buka Modal Tambah
  const openAddModal = () => {
    setAddForm({
      name: '',
      username: '',
      nik: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'Petugas Kesehatan',
      status: 'Aktif',
    })
    setAddErrors({})
    setIsAddModalOpen(true)
  }

  // Submit Tambah Pengguna
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (!addForm.name.trim()) errs.name = 'Nama lengkap wajib diisi.'
    if (!addForm.username.trim()) {
      errs.username = 'Username wajib diisi.'
    } else if (users.some((u) => u.username.toLowerCase() === addForm.username.toLowerCase().trim())) {
      errs.username = 'Username sudah digunakan akun lain.'
    }
    if (!addForm.nik.trim()) {
      errs.nik = 'NIK wajib diisi.'
    } else if (!/^\d{16}$/.test(addForm.nik.trim())) {
      errs.nik = 'NIK harus berupa 16 digit angka.'
    } else if (users.some((u) => u.nik === addForm.nik.trim())) {
      errs.nik = 'NIK sudah terdaftar pada akun lain.'
    }
    if (!addForm.email.trim()) {
      errs.email = 'Email wajib diisi.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email.trim())) {
      errs.email = 'Format email tidak valid.'
    }
    if (!addForm.password) {
      errs.password = 'Kata sandi wajib diisi.'
    } else if (addForm.password.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter.'
    }
    if (addForm.password !== addForm.confirmPassword) {
      errs.confirmPassword = 'Konfirmasi kata sandi tidak cocok.'
    }

    if (Object.keys(errs).length > 0) {
      setAddErrors(errs)
      return
    }

    const nowStr = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())

    const newUser: UserAccount = {
      id: String(Date.now()),
      name: addForm.name.trim(),
      username: addForm.username.trim().toLowerCase(),
      nik: addForm.nik.trim(),
      email: addForm.email.trim().toLowerCase(),
      phone: addForm.phone.trim() || '0812-0000-0000',
      role: addForm.role,
      status: addForm.status,
      createdAt: nowStr,
      lastLogin: 'Belum pernah login',
    }

    const updated = [newUser, ...users]
    updateUsersState(updated)
    setSelectedUser(newUser)
    setIsAddModalOpen(false)
    showToast(`Pengguna "${newUser.name}" berhasil ditambahkan!`)
  }

  // Buka Modal Edit
  const openEditModal = (user: UserAccount) => {
    setUserToEdit(user)
    setEditForm({
      name: user.name,
      username: user.username,
      nik: user.nik,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      changePassword: false,
      newPassword: '',
      confirmNewPassword: '',
    })
    setEditErrors({})
    setIsEditModalOpen(true)
  }

  // Submit Edit Pengguna
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userToEdit) return

    const errs: Record<string, string> = {}
    if (!editForm.name.trim()) errs.name = 'Nama lengkap wajib diisi.'
    if (!editForm.username.trim()) {
      errs.username = 'Username wajib diisi.'
    } else if (
      users.some(
        (u) =>
          u.id !== userToEdit.id &&
          u.username.toLowerCase() === editForm.username.toLowerCase().trim(),
      )
    ) {
      errs.username = 'Username sudah dipakai akun lain.'
    }
    if (!editForm.nik.trim()) {
      errs.nik = 'NIK wajib diisi.'
    } else if (!/^\d{16}$/.test(editForm.nik.trim())) {
      errs.nik = 'NIK harus berupa 16 digit angka.'
    } else if (
      users.some((u) => u.id !== userToEdit.id && u.nik === editForm.nik.trim())
    ) {
      errs.nik = 'NIK sudah terdaftar pada akun lain.'
    }
    if (!editForm.email.trim()) {
      errs.email = 'Email wajib diisi.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errs.email = 'Format email tidak valid.'
    }

    if (editForm.changePassword) {
      if (!editForm.newPassword) {
        errs.newPassword = 'Kata sandi baru wajib diisi.'
      } else if (editForm.newPassword.length < 6) {
        errs.newPassword = 'Kata sandi minimal 6 karakter.'
      }
      if (editForm.newPassword !== editForm.confirmNewPassword) {
        errs.confirmNewPassword = 'Konfirmasi kata sandi tidak cocok.'
      }
    }

    if (Object.keys(errs).length > 0) {
      setEditErrors(errs)
      return
    }

    const updatedUser: UserAccount = {
      ...userToEdit,
      name: editForm.name.trim(),
      username: editForm.username.trim().toLowerCase(),
      nik: editForm.nik.trim(),
      email: editForm.email.trim().toLowerCase(),
      phone: editForm.phone.trim() || userToEdit.phone,
      role: editForm.role,
      status: editForm.status,
    }

    const updated = users.map((u) => (u.id === userToEdit.id ? updatedUser : u))
    updateUsersState(updated)

    if (selectedUser?.id === userToEdit.id) {
      setSelectedUser(updatedUser)
    }

    setIsEditModalOpen(false)
    showToast(`Data akun "${updatedUser.name}" berhasil diperbarui!`)
  }

  // Toggle Status Aktif/Nonaktif
  const handleToggleStatus = (user: UserAccount) => {
    const nextStatus: AdminUserStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif'
    const updated = users.map((u) =>
      u.id === user.id ? { ...u, status: nextStatus } : u,
    )
    updateUsersState(updated)
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...selectedUser, status: nextStatus })
    }
    setUserToDeactivate(null)
    showToast(
      `Status akun "${user.name}" diubah menjadi ${nextStatus}.`,
      nextStatus === 'Aktif' ? 'success' : 'info',
    )
  }

  // Hapus Akun Pengguna
  const handleDeleteUser = (user: UserAccount) => {
    const updated = users.filter((u) => u.id !== user.id)
    updateUsersState(updated)
    if (selectedUser?.id === user.id) {
      setSelectedUser(updated[0] || null)
    }
    setUserToDelete(null)
    showToast(`Akun "${user.name}" berhasil dihapus.`, 'danger')
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
            <Link to="/admin" className="transition-colors hover:text-primary">
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-text">Manajemen Pengguna</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Manajemen Pengguna
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kelola akun administrator dan petugas kesehatan yang memiliki akses ke sistem MeaslesCare.
          </p>
        </div>

        {/* Tombol Utama Tambah Pengguna di Header */}
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-action-hover active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Ringkasan Statistik (4 Kartu) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Kartu 1: Total Pengguna */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-action/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Total Pengguna
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                ↑ +2
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">{totalCount}</p>
            <p className="mt-1 text-xs text-muted">seluruh akun terdaftar</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-action">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M3 19c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" />
              <path d="M16 11a3 3 0 1 0-1.2-5.5M17.5 19c-.3-1.8-1.2-3.2-2.5-4" />
            </svg>
          </div>
        </div>

        {/* Kartu 2: Admin */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-purple-300">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Admin
            </span>
            <p className="mt-2 text-3xl font-bold text-text tabular">{adminCount}</p>
            <p className="mt-1 text-xs text-muted">akun dengan akses penuh</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple-50 text-purple-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>

        {/* Kartu 3: Petugas Kesehatan */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-emerald-300">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Petugas Kesehatan
            </span>
            <p className="mt-2 text-3xl font-bold text-text tabular">{petugasCount}</p>
            <p className="mt-1 text-xs text-muted">akun petugas operasional</p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3" />
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
              <circle cx="20" cy="10" r="2" />
            </svg>
          </div>
        </div>

        {/* Kartu 4: Pengguna Aktif */}
        <div className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface p-5 shadow-card transition-all hover:border-cyan-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Pengguna Aktif
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-bold text-cyan-700">
                {inactiveCount === 0 ? '100%' : `${activeCount}/${totalCount}`}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-text tabular">{activeCount}</p>
            <p className="mt-1 text-xs text-muted">
              {inactiveCount > 0 ? `${inactiveCount} akun dinonaktifkan` : 'seluruh akun aktif bertugas'}
            </p>
          </div>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabel Manajemen Pengguna + Panel Detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Tabel (8 kolom jika detail buka, 12 jika tutup) */}
        <div className={cn(selectedUser ? 'lg:col-span-8' : 'lg:col-span-12', 'transition-all duration-200')}>
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
                  <h2 className="text-base font-bold text-text">Daftar Pengguna</h2>
                  <p className="text-xs text-muted">
                    Total {totalItems} pengguna ditemukan {search || roleFilter !== 'Semua' || statusFilter !== 'Semua' ? '(terfilter)' : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-action px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-action-hover"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Tambah Pengguna</span>
              </button>
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
                  placeholder="Cari pengguna (nama, NIK, username, atau email)..."
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

              {/* Filter Role */}
              <div className="w-auto">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as 'Semua' | AdminUserRole)
                    setPage(1)
                  }}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-3 pr-8 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                >
                  <option value="Semua">Semua Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Petugas Kesehatan">Petugas Kesehatan</option>
                </select>
              </div>

              {/* Filter Status */}
              <div className="w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as 'Semua' | AdminUserStatus)
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
              {(search || roleFilter !== 'Semua' || statusFilter !== 'Semua') && (
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
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-soft bg-surface-muted/70 text-xs font-bold uppercase tracking-wider text-muted">
                    <th className="w-12 px-4 py-3.5 text-center">No</th>
                    <th className="px-4 py-3.5">Nama</th>
                    <th className="px-4 py-3.5">Username</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Terakhir Login</th>
                    <th className="w-28 px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-muted">
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                          <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                            🔍
                          </span>
                          <p className="text-sm font-semibold text-text">Tidak ada pengguna yang cocok</p>
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
                    paginatedUsers.map((u, idx) => {
                      const rowNumber = (page - 1) * pageSize + idx + 1
                      const isSelected = selectedUser?.id === u.id

                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
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

                          {/* Nama dengan Avatar Inisial */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-bold shadow-2xs',
                                  getAvatarColor(u.name),
                                )}
                              >
                                {getInitials(u.name)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-text group-hover:text-action">
                                  {u.name}
                                </p>
                                <p className="truncate text-[11px] text-muted">
                                  NIK: <span className="tabular">{u.nik}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Username */}
                          <td className="px-4 py-3.5">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {u.username}
                            </span>
                          </td>

                          {/* Role Badge */}
                          <td className="px-4 py-3.5">
                            {u.role === 'Admin' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-3">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                <span>Admin</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-3">
                                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3" />
                                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                                  <circle cx="20" cy="10" r="2" />
                                </svg>
                                <span>Petugas Kesehatan</span>
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            {u.status === 'Aktif' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600">
                                <span className="size-2 rounded-full bg-rose-500" />
                                <span>Nonaktif</span>
                              </span>
                            )}
                          </td>

                          {/* Terakhir Login */}
                          <td className="px-4 py-3.5 tabular text-xs text-muted">
                            {u.lastLogin}
                          </td>

                          {/* Tombol Aksi */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {/* Lihat Detail */}
                              <button
                                type="button"
                                title="Lihat detail pengguna"
                                onClick={() => setSelectedUser(u)}
                                className={cn(
                                  'grid size-8 place-items-center rounded-lg border transition-colors',
                                  isSelected
                                    ? 'border-action bg-action text-white'
                                    : 'border-border-soft bg-surface text-action hover:bg-action-soft hover:border-action',
                                )}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>

                              {/* Edit Data */}
                              <button
                                type="button"
                                title="Edit data pengguna"
                                onClick={() => openEditModal(u)}
                                className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-indigo-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                                  <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                                  <path d="m14.5 7.5 2.5 2.5" />
                                </svg>
                              </button>

                              {/* Nonaktifkan / Hapus */}
                              <button
                                type="button"
                                title={u.status === 'Aktif' ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                                onClick={() => setUserToDeactivate(u)}
                                className="grid size-8 place-items-center rounded-lg border border-border-soft bg-surface text-rose-600 transition-colors hover:border-rose-400 hover:bg-rose-50"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
                dari <span className="font-semibold text-text">{totalItems}</span> pengguna
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

        {/* Kolom Kanan: Card Detail Pengguna (Persis seperti mockup screenshot) */}
        {selectedUser && (
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
                  <h3 className="text-sm font-bold text-text">Detail Pengguna</h3>
                </div>

                <button
                  type="button"
                  title="Tutup panel detail"
                  onClick={() => setSelectedUser(null)}
                  className="grid size-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Profile Avatar & Name */}
              <div className="flex flex-col items-center py-6 text-center">
                <div className="relative mb-3">
                  <div
                    className={cn(
                      'grid size-20 place-items-center rounded-full border-4 border-white text-2xl font-bold shadow-md',
                      getAvatarColor(selectedUser.name),
                    )}
                  >
                    {getInitials(selectedUser.name)}
                  </div>
                </div>

                <h4 className="text-base font-bold text-text">{selectedUser.name}</h4>

                {/* Role Badge */}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {selectedUser.role === 'Admin' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3" />
                        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                        <circle cx="20" cy="10" r="2" />
                      </svg>
                      Petugas Kesehatan
                    </span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      selectedUser.status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700',
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        selectedUser.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500',
                      )}
                    />
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Data List (Format rapi dengan ikon sesuai mockup) */}
              <div className="space-y-3.5 border-t border-border-soft pt-4 text-xs">
                {/* Username */}
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="w-28 text-muted">Username</span>
                  <span className="text-muted">:</span>
                  <span className="font-semibold text-text">{selectedUser.username}</span>
                </div>

                {/* NIK */}
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <rect width="18" height="14" x="3" y="5" rx="2" />
                      <line x1="7" x2="11" y1="15" y2="15" />
                    </svg>
                  </span>
                  <span className="w-28 text-muted">NIK</span>
                  <span className="text-muted">:</span>
                  <span className="font-semibold tabular text-text">{selectedUser.nik}</span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <span className="w-28 text-muted">Email</span>
                  <span className="text-muted">:</span>
                  <span className="truncate font-medium text-text">{selectedUser.email}</span>
                </div>

                {/* Nomor Telepon */}
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span className="w-28 text-muted">Nomor Telepon</span>
                  <span className="text-muted">:</span>
                  <span className="font-semibold tabular text-text">{selectedUser.phone}</span>
                </div>

                {/* Tanggal Dibuat */}
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </span>
                  <span className="w-28 text-muted">Tanggal Dibuat</span>
                  <span className="text-muted">:</span>
                  <span className="tabular text-text">{selectedUser.createdAt}</span>
                </div>

                {/* Terakhir Login */}
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span className="w-28 text-muted">Terakhir Login</span>
                  <span className="text-muted">:</span>
                  <span className="tabular font-medium text-text">{selectedUser.lastLogin}</span>
                </div>
              </div>

              {/* Action Buttons di Bawah Panel */}
              <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-border-soft">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedUser)}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-action bg-white px-3 py-2 text-xs font-semibold text-action transition hover:bg-action-soft"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
                      <path d="m14.5 7.5 2.5 2.5" />
                    </svg>
                    <span>Ubah Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserToDeactivate(selectedUser)}
                    className={cn(
                      'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition',
                      selectedUser.status === 'Aktif'
                        ? 'border-rose-300 bg-rose-50/50 text-rose-600 hover:bg-rose-100'
                        : 'border-emerald-300 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100',
                    )}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" x2="12" y1="2" y2="12" />
                    </svg>
                    <span>
                      {selectedUser.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </span>
                  </button>
                </div>

                {/* Hapus Permanen */}
                <button
                  type="button"
                  onClick={() => setUserToDelete(selectedUser)}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition hover:text-rose-600 hover:bg-rose-50"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                  <span>Hapus Akun Pengguna</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: Tambah Pengguna Baru
      ======================================================== */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h2 className="text-lg font-bold text-text">Tambah Pengguna Baru</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Tambahkan akun baru yang memiliki akses ke sistem dashboard MeaslesCare.
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

            <form onSubmit={handleAddSubmit} noValidate className="mt-5 space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-text">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Contoh: Dr. Sarah Amanda"
                  className={cn(
                    'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                    addErrors.name
                      ? 'border-rose-400 focus-visible:ring-rose-200'
                      : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                  )}
                />
                {addErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{addErrors.name}</p>
                )}
              </div>

              {/* Grid: NIK & Username */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">
                    NIK (16 Digit) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={addForm.nik}
                    onChange={(e) => setAddForm({ ...addForm, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="3201012345678901"
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs tabular text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.nik
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.nik && (
                    <p className="mt-1 text-xs text-rose-600">{addErrors.nik}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">
                    Username <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    placeholder="sarah.amanda"
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.username
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.username && (
                    <p className="mt-1 text-xs text-rose-600">{addErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Grid: Email & Telepon */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="sarah@puskesmas.id"
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.email
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.email && (
                    <p className="mt-1 text-xs text-rose-600">{addErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="mt-1.5 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs tabular text-text transition focus-visible:border-action focus-visible:outline-none"
                  />
                </div>
              </div>

              {/* Grid: Password & Konfirmasi Password */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">
                    Kata Sandi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.password
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.password && (
                    <p className="mt-1 text-xs text-rose-600">{addErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">
                    Konfirmasi Kata Sandi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi kata sandi"
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      addErrors.confirmPassword
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {addErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{addErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Grid: Role & Status */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">Role Pengguna</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as AdminUserRole })}
                    className="mt-1.5 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Petugas Kesehatan">Petugas Kesehatan (Operasional)</option>
                    <option value="Admin">Admin (Akses Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">Status Awal</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as AdminUserStatus })}
                    className="mt-1.5 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Tertunda)</option>
                  </select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-4 text-xs font-semibold text-muted transition hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-action px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-action-hover"
                >
                  <span>Simpan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: Edit Data Pengguna
      ======================================================== */}
      {isEditModalOpen && userToEdit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start justify-between border-b border-border-soft pb-4">
              <div>
                <h2 className="text-lg font-bold text-text">Edit Data Pengguna</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Perbarui informasi profil atau akses akun {userToEdit.name}.
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

            <form onSubmit={handleEditSubmit} noValidate className="mt-5 space-y-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-text">
                  Nama Lengkap <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={cn(
                    'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                    editErrors.name
                      ? 'border-rose-400 focus-visible:ring-rose-200'
                      : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                  )}
                />
                {editErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{editErrors.name}</p>
                )}
              </div>

              {/* Grid: NIK & Username */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">
                    NIK (16 Digit) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={editForm.nik}
                    onChange={(e) => setEditForm({ ...editForm, nik: e.target.value.replace(/\D/g, '') })}
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs tabular text-text transition focus-visible:outline-none focus-visible:ring-2',
                      editErrors.nik
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {editErrors.nik && (
                    <p className="mt-1 text-xs text-rose-600">{editErrors.nik}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">
                    Username <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      editErrors.username
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {editErrors.username && (
                    <p className="mt-1 text-xs text-rose-600">{editErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Grid: Email & Telepon */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className={cn(
                      'mt-1.5 min-h-10 w-full rounded-xl border bg-surface px-3 text-xs text-text transition focus-visible:outline-none focus-visible:ring-2',
                      editErrors.email
                        ? 'border-rose-400 focus-visible:ring-rose-200'
                        : 'border-border-soft focus-visible:border-action focus-visible:ring-action/15',
                    )}
                  />
                  {editErrors.email && (
                    <p className="mt-1 text-xs text-rose-600">{editErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-1.5 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs tabular text-text transition focus-visible:border-action focus-visible:outline-none"
                  />
                </div>
              </div>

              {/* Grid: Role & Status */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as AdminUserRole })}
                    className="mt-1.5 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Petugas Kesehatan">Petugas Kesehatan</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AdminUserStatus })}
                    className="mt-1.5 min-h-10 w-full rounded-xl border border-border-soft bg-surface px-3 text-xs font-medium text-text transition focus-visible:border-action focus-visible:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Opsi Ubah Password Terpisah */}
              <div className="rounded-xl border border-border-soft bg-surface-muted/60 p-3.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.changePassword}
                    onChange={(e) => setEditForm({ ...editForm, changePassword: e.target.checked })}
                    className="size-4 rounded border-border-soft text-action focus:ring-action"
                  />
                  <span className="text-xs font-bold text-text">Ubah Kata Sandi Akun Ini</span>
                </label>

                {editForm.changePassword && (
                  <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-border-soft pt-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-text">
                        Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className={cn(
                          'mt-1 min-h-9 w-full rounded-lg border bg-surface px-2.5 text-xs transition focus-visible:outline-none',
                          editErrors.newPassword ? 'border-rose-400' : 'border-border-soft focus-visible:border-action',
                        )}
                      />
                      {editErrors.newPassword && (
                        <p className="mt-0.5 text-[11px] text-rose-600">{editErrors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <input
                        type="password"
                        value={editForm.confirmNewPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmNewPassword: e.target.value })}
                        placeholder="Ulangi kata sandi baru"
                        className={cn(
                          'mt-1 min-h-9 w-full rounded-lg border bg-surface px-2.5 text-xs transition focus-visible:outline-none',
                          editErrors.confirmNewPassword ? 'border-rose-400' : 'border-border-soft focus-visible:border-action',
                        )}
                      />
                      {editErrors.confirmNewPassword && (
                        <p className="mt-0.5 text-[11px] text-rose-600">{editErrors.confirmNewPassword}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="min-h-10 rounded-xl border border-border-soft bg-surface px-4 text-xs font-semibold text-muted transition hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-action px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-action-hover"
                >
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: Konfirmasi Nonaktifkan / Aktifkan Akun
      ======================================================== */}
      {userToDeactivate && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setUserToDeactivate(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-2xl',
                  userToDeactivate.status === 'Aktif'
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
                  {userToDeactivate.status === 'Aktif'
                    ? 'Nonaktifkan Akun Pengguna?'
                    : 'Aktifkan Kembali Akun Pengguna?'}
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {userToDeactivate.status === 'Aktif'
                    ? `Akun "${userToDeactivate.name}" (${userToDeactivate.username}) tidak akan dapat masuk ke sistem dashboard hingga diaktifkan kembali.`
                    : `Akun "${userToDeactivate.name}" (${userToDeactivate.username}) akan dapat kembali masuk dan mengoperasikan dashboard MeaslesCare.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => setUserToDeactivate(null)}
                className="min-h-9 rounded-xl border border-border-soft bg-surface px-4 text-xs font-semibold text-muted hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(userToDeactivate)}
                className={cn(
                  'min-h-9 rounded-xl px-4 text-xs font-semibold text-white shadow-sm transition',
                  userToDeactivate.status === 'Aktif'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700',
                )}
              >
                {userToDeactivate.status === 'Aktif' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: Konfirmasi Hapus Akun Pengguna
      ======================================================== */}
      {userToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
        >
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setUserToDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border-soft bg-surface p-6 shadow-pop">
            <div className="flex items-start gap-3.5">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-text">Hapus Akun Pengguna?</h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Apakah Anda yakin ingin menghapus akun <span className="font-semibold text-text">{userToDelete.name}</span> ({userToDelete.username})? Tindakan ini bersifat permanen dan data akun akan dihapus dari daftar pengguna.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border-soft pt-4">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="min-h-9 rounded-xl border border-border-soft bg-surface px-4 text-xs font-semibold text-muted hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(userToDelete)}
                className="min-h-9 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
