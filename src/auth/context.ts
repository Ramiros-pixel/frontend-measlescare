import { createContext, useContext } from 'react'
import type { User } from '@/api/types'
import type { authApi } from '@/api/endpoints'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (nik: string, password: string) => Promise<User>
  register: (input: Parameters<typeof authApi.register>[0]) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth dipakai di luar AuthProvider')
  return ctx
}
