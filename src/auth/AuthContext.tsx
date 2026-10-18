import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api/endpoints'
import { getToken, setToken } from '@/api/client'
import { AuthContext, useAuth } from '@/auth/context'
import type { AuthContextValue } from '@/auth/context'
import { isAdmin } from '@/api/types'
import type { User } from '@/api/types'

// Sesi dipulihkan dari token tersimpan; /auth/me menjadi sumber kebenaran profil.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    let alive = true
    authApi
      .me()
      .then((u) => {
        if (alive) setUser(u)
      })
      .catch(() => {
        setToken(null)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    login: async (nik, password) => {
      const token = await authApi.login({ NIK: nik, password })
      setToken(token.access_token)
      const me = await authApi.me()
      setUser(me)
      return me
    },
    register: async (input) => {
      const created = await authApi.register(input)
      const token = await authApi.login({ NIK: created.NIK, password: input.password })
      setToken(token.access_token)
      const me = await authApi.me()
      setUser(me)
      return me
    },
    logout: () => {
      setToken(null)
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { useAuth, isAdmin }
