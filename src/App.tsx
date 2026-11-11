
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { PublicOnly, RequireAuth } from '@/routes/guards'

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
import { UserPublicLayout } from '@/components/layout/UserPublicLayout'

import BerandaPage from '@/pages/user/BerandaPage'
import FungsiAlatPage from '@/pages/user/FungsiAlatPage'
import CaraPenggunaanPage from '@/pages/user/CaraPenggunaanPage'
import IdentifikasiPage from '@/pages/user/IdentifikasiPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />

        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Halaman publik dengan navbar */}
        <Route path="/user" element={<UserPublicLayout />}>
          <Route index element={<BerandaPage />} />
          <Route path="fungsi-alat" element={<FungsiAlatPage />} />
          <Route path="cara-penggunaan" element={<CaraPenggunaanPage />} />
        </Route>

        {/* Halaman identifikasi tanpa navbar */}
        <Route
          path="/user/skrining/identifikasi"
          element={<IdentifikasiPage />}
        />

        {/* Halaman user yang membutuhkan autentikasi */}
        <Route element={<RequireAuth />}>
          <Route element={<UserLayout />}>
            <Route path="/beranda" element={<HomePage />} />
            <Route path="/periksa" element={<CheckupPage />} />
            <Route path="/hasil/:id" element={<ResultPage />} />
            <Route path="/riwayat" element={<HistoryPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Halaman admin */}
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
