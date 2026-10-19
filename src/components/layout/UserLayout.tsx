import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/cn'

// Ikon nav digambar sendiri, satu per fungsi, tanpa library generik (R-04).
function NavIcon({ name, className }: { name: string; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className: cn('size-5', className),
  }
  switch (name) {
    case 'beranda':
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" /></svg>
    case 'periksa':
      return <svg {...common}><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" /><path d="M12 12v5M9 8.8l3 1.7 3-1.7" /></svg>
    case 'riwayat':
      return <svg {...common}><path d="M12 7v5l3 2" /><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" /></svg>
    case 'profil':
      return <svg {...common}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4" /></svg>
    default:
      return null
  }
}

const NAV = [
  { to: '/beranda', label: 'Beranda', icon: 'beranda' },
  { to: '/periksa', label: 'Periksa', icon: 'periksa' },
  { to: '/riwayat', label: 'Riwayat', icon: 'riwayat' },
  { to: '/profil', label: 'Profil', icon: 'profil' },
]

export function UserLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-6">
        <Link to="/beranda" className="text-base font-bold text-primary">
          MeaslesCare
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-11 rounded-md px-3 text-sm font-semibold text-muted hover:bg-surface hover:text-danger"
        >
          Keluar
        </button>
      </header>

      <main className="flex-1 px-4 pb-28 sm:px-6 sm:pb-10">
        <Outlet />
      </main>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="mx-auto grid max-w-3xl grid-cols-4">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                    isActive ? 'text-primary' : 'text-muted',
                  )
                }
              >
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-label="Navigasi utama"
        className="hidden border-t border-border-soft bg-surface px-6 py-2 sm:block"
      >
        <ul className="mx-auto flex max-w-3xl gap-1">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold',
                    isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-muted hover:text-text',
                  )
                }
              >
                <NavIcon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

    </div>
  )
}
