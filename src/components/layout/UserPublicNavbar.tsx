import { NavLink, Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

const NAV_ITEMS = [
  { to: '/user', label: 'Beranda' },
  { to: '/user/fungsi-alat', label: 'Fungsi Alat' },
  { to: '/user/cara-penggunaan', label: 'Cara Penggunaan' },
]

export function UserPublicNavbar() {
  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-slate-100 bg-white/95 backdrop-blur-sm sm:h-[88px]">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link to="/user" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#0860F5] font-bold text-white text-sm">
            M
          </span>
          <span className="text-xl font-bold text-[#0a1f44] sm:text-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            MeaslesCare
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-5 sm:flex lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/user'}
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 text-base font-semibold transition-colors lg:px-4',
                  isActive
                    ? 'text-[#0860F5]'
                    : 'text-[#4a5568] hover:text-[#0860F5]',
                )
              }
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-1 h-[2.5px] rounded-full bg-[#0860F5]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <MobileNav />
      </div>
    </header>
  )
}

function MobileNav() {
  return (
    <div className="sm:hidden">
      <details className="group relative">
        <summary className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 list-none">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </summary>
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/user'}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-blue-50 text-[#0860F5]'
                    : 'text-slate-600 hover:bg-slate-50',
                )
              }
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </details>
    </div>
  )
}

