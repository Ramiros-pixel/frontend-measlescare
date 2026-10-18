import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthContext'
import { cn } from '@/lib/cn'

function AdminIcon({ name, className }: { name: string; className?: string }) {
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
    case 'ringkasan':
      return <svg {...common}><path d="M4 19h16" /><path d="M7 16v-5m5 5V7m5 9v-8" /></svg>
    case 'pengguna':
      return <svg {...common}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.7-3.2 3-4.9 5.5-4.9s4.8 1.7 5.5 4.9" /><path d="M16 11.5a3 3 0 1 0-1.5-5.6M17.5 19c-.3-1.7-1-3-2-3.9" /></svg>
    case 'pemeriksaan':
      return <svg {...common}><path d="M6 3.5h9L19 7.5v13H6v-17Z" /><path d="M9.5 9h5m-5 3.5h5m-5 3.5h3" /></svg>
    case 'area-user':
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" /></svg>
    case 'keluar':
      return <svg {...common}><path d="M14 4h-8v16h8M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5" /></svg>
    default:
      return null
  }
}

const ADMIN_NAV = [
  { to: '/admin', label: 'Ringkasan', icon: 'ringkasan', end: true },
  { to: '/admin/pengguna', label: 'Pengguna', icon: 'pengguna' },
  { to: '/admin/pemeriksaan', label: 'Pemeriksaan', icon: 'pemeriksaan' },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    logout()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  const items = [...ADMIN_NAV, { to: '/beranda', label: 'Area pengguna', icon: 'area-user' }]

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <header className="flex items-center justify-between border-b border-border-soft bg-surface px-4 py-2 lg:hidden">
        <span className="text-base font-bold text-primary">MeaslesCare Admin</span>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-11 rounded-md px-3 text-sm font-semibold text-muted hover:text-danger"
        >
          Keluar
        </button>
      </header>

      <aside
        aria-label="Navigasi admin"
        className="hidden w-56 shrink-0 flex-col justify-between border-r border-border-soft bg-surface px-3 py-4 lg:flex"
      >
        <div>
          <p className="px-2 pb-4 text-base font-bold text-primary">MeaslesCare Admin</p>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={'end' in item ? Boolean(item.end) : false}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-2.5 rounded-md px-3 text-sm font-semibold',
                      isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-surface-muted hover:text-text',
                    )
                  }
                >
                  <AdminIcon name={item.icon} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="px-2">
          <p className="text-sm font-semibold text-text">{user?.Name}</p>
          <p className="pb-3 text-xs text-muted">Admin · {user?.NIK}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-muted hover:text-danger"
          >
            <AdminIcon name="keluar" />
            Keluar
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-6 lg:pb-8">
        <Outlet />
      </main>

      <nav
        aria-label="Navigasi admin"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={'end' in item ? Boolean(item.end) : false}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium',
                    isActive ? 'text-primary' : 'text-muted',
                  )
                }
              >
                <AdminIcon name={item.icon} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
