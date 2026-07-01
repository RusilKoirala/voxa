'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { fetchUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`)
        setStatus('success')
        setMessage('Email verified successfully!')
        toast.success('Email verified!')
        
        // Clear cached user and fetch fresh data
        localStorage.removeItem('voxa_user')
        await fetchUser()
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error: any) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Verification failed')
        toast.error('Verification failed')
      }
    }

    verifyToken()
  }, [searchParams, router, fetchUser])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' ? 'Verifying your email...' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-muted-foreground">Please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-green-600 text-center">{message}</p>
              <p className="text-sm text-muted-foreground text-center">Redirecting to home...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-600 text-center">{message}</p>
              <Button 
                className="w-full"
                onClick={() => router.push('/register')}
                variant="secondary"
              >
                Back to Register
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
