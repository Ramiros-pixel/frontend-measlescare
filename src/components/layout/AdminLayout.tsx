import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/cn'
import { Icon, type IconName } from '@/components/ui/Icon'

interface NavItem {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

interface NavGroup {
  title: string
  items: NavItem[]
}

/* Susunan menu mengikuti gambar referensi admin (7 tujuan dalam 2 grup). */
const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Menu Utama',
    items: [
      { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/admin/pasien', label: 'Manajemen Pasien', icon: 'pasien' },
      { to: '/admin/skrining', label: 'Data Skrining', icon: 'skrining' },
      { to: '/admin/laporan', label: 'Laporan & Statistik', icon: 'laporan' },
    ],
  },
  {
    title: 'Manajemen Sistem',
    items: [
      { to: '/admin/kiosk', label: 'Perangkat Kiosk', icon: 'kiosk' },
      { to: '/admin/pengguna', label: 'Manajemen Pengguna', icon: 'pengguna' },
      { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'pengaturan' },
    ],
  },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-sidebar-text/70">
            {group.title}
          </p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? false}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-150',
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white',
                    )
                  }
                >
                  <Icon name={item.icon} className="size-5 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/15">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-6 text-white">
          <path d="M12 4.5v15M4.5 12h15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold leading-tight text-white">MeaslesCare</span>
        <span className="block text-[11px] leading-tight text-sidebar-text">Admin Fasilitas Kesehatan</span>
      </span>
    </div>
  )
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/', { replace: true })
  }

  const hariIni = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col justify-between bg-sidebar lg:flex">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
          <Brand />
          <div className="mt-6">
            <SidebarNav />
          </div>
        </div>
        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="text-sm font-semibold text-white">{user?.Name}</p>
          <p className="pb-3 text-xs text-sidebar-text">Admin · {user?.NIK}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 text-sm font-semibold text-sidebar-text transition-colors duration-150 hover:bg-sidebar-hover hover:text-white"
          >
            <Icon name="keluar" className="size-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup navigasi"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-slate-900/50"
          />
          <aside className="relative flex h-full w-72 flex-col justify-between bg-sidebar">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
              <Brand />
              <div className="mt-6">
                <SidebarNav onNavigate={() => setSidebarOpen(false)} />
              </div>
            </div>
            <div className="border-t border-sidebar-border px-4 py-4">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex min-h-11 w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 text-sm font-semibold text-sidebar-text"
              >
                <Icon name="keluar" className="size-5" />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border-soft bg-surface/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Buka navigasi"
                onClick={() => setSidebarOpen(true)}
                className="grid size-10 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text lg:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                  className="size-5"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <span className="text-base font-bold text-primary lg:hidden">MeaslesCare Admin</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm text-text sm:flex">
                <Icon name="kalender" className="size-4 text-muted" />
                <span className="tabular">Hari ini, {hariIni}</span>
              </div>
              <button
                type="button"
                aria-label="Notifikasi"
                title="Notifikasi belum tersedia di backend"
                onClick={() => setMenuOpen((v) => !v)}
                className="relative grid size-10 place-items-center rounded-lg border border-border-soft bg-surface text-muted transition-colors duration-150 hover:text-text"
              >
                <Icon name="lonceng" className="size-5" />
                <span aria-hidden className="absolute right-2 top-2 size-2 rounded-full bg-danger" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex min-h-10 items-center gap-2 rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-sm font-semibold text-text transition-colors duration-150 hover:border-action"
                >
                  <span className="grid size-7 place-items-center rounded-full bg-action-soft text-action">
                    <Icon name="user" className="size-4" />
                  </span>
                  <span className="hidden sm:inline">{user?.Name ?? 'Admin'}</span>
                  <Icon name="chevron-bawah" className="size-4 text-muted" />
                </button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Tutup menu"
                      onClick={() => setMenuOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border-soft bg-surface p-2 shadow-pop">
                      <div className="border-b border-border-soft px-2 pb-2">
                        <p className="text-sm font-bold text-text">{user?.Name}</p>
                        <p className="tabular text-xs text-muted">{user?.NIK}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          navigate('/beranda')
                        }}
                        className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-surface-muted hover:text-text"
                      >
                        <Icon name="pasien" className="size-4" />
                        Area pengguna
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm font-semibold text-danger transition-colors duration-150 hover:bg-danger-soft"
                      >
                        <Icon name="keluar" className="size-4" />
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
