import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { PublicOnly, RequireAuth } from '@/routes/guards'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import CheckupPage from '@/pages/CheckupPage'
import ResultPage from '@/pages/ResultPage'
import HistoryPage from '@/pages/HistoryPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import AdminRecordsPage from '@/pages/admin/AdminRecordsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { UserLayout } from '@/components/layout/UserLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicOnly />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<UserLayout />}>
            <Route path="/beranda" element={<HomePage />} />
            <Route path="/periksa" element={<CheckupPage />} />
            <Route path="/hasil/:id" element={<ResultPage />} />
            <Route path="/riwayat" element={<HistoryPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth requireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/pengguna" element={<AdminUsersPage />} />
            <Route path="/admin/pengguna/:nik" element={<AdminUserDetailPage />} />
            <Route path="/admin/pemeriksaan" element={<AdminRecordsPage />} />
            <Route path="/admin/pemeriksaan/:id" element={<ResultPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
