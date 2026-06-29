'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '@/lib/api'
import { User, ApiResponse } from '@/types'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me')
      console.log('👤 Fetched user:', response.data)
      setUser(response.data.data!)
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch user:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', { email, password })
    console.log('✅ Logged in:', response.data)
    setUser(response.data.data!.user)
    router.push('/')
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', { username, email, password })
    console.log('✅ Registered:', response.data)
    setUser(response.data.data!.user)
    router.push('/')
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}



export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}