'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '@/lib/api'
import { User, ApiResponse } from '@/types'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ needsVerification?: boolean; email?: string }>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ['/', '/login', '/register', '/verify-email', '/verify-required']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = async () => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me')
      console.log('👤 Fetched user:', response.data)
      const userData = response.data.data!
      setUser(userData)
      // Cache user in localStorage for faster loading
      localStorage.setItem('voxa_user', JSON.stringify(userData))
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch user:', error)
      }
      setUser(null)
      localStorage.removeItem('voxa_user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is already loaded from localStorage
    const cachedUser = localStorage.getItem('voxa_user')
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser)
        setUser(userData)
        setLoading(false)
      } catch (e) {
        // If parsing fails, fetch fresh data
        fetchUser()
      }
    } else {
      fetchUser()
    }
  }, [])

  useEffect(() => {
    // Redirect unverified users
    if (!loading && user && !user.isVerified && !publicPaths.includes(pathname)) {
      router.push(`/verify-required?email=${encodeURIComponent(user.email)}`)
    }
  }, [user, loading, pathname, router])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', { email, password })
      console.log('✅ Logged in:', response.data)
      const userData = response.data.data!.user
      setUser(userData)
      localStorage.setItem('voxa_user', JSON.stringify(userData))
      
      if (!userData.isVerified) {
        return { needsVerification: true, email }
      }
      
      router.push('/')
      return {}
    } catch (error: any) {
      if (error.response?.data?.needsVerification) {
        return { needsVerification: true, email }
      }
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', { username, email, password })
    console.log('✅ Registered:', response.data)
    const userData = response.data.data!.user
    setUser(userData)
    localStorage.setItem('voxa_user', JSON.stringify(userData))
    router.push(`/verify-required?email=${encodeURIComponent(email)}`)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    localStorage.removeItem('voxa_user')
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
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
