import { Outlet } from 'react-router-dom'
import { UserPublicNavbar } from './UserPublicNavbar'

export function UserPublicLayout() {
  return (
    <div className="min-h-dvh bg-white" style={{ fontFamily: "'Poppins', 'Public Sans', sans-serif" }}>
      <UserPublicNavbar />
      <Outlet />
    </div>
  )
}

