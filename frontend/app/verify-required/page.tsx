'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/api'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function VerifyRequiredPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [resending, setResending] = useState(false)

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setResending(true)
    try {
      await api.post('/auth/resend-verification', { email })
      toast.success('Verification email resent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">voxa</span>
          </Link>
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <CardDescription>
            Please verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            We've sent a verification link to your email. Click the link to verify your account.
          </p>
          
          <form onSubmit={handleResend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={resending}
            >
              {resending ? 'Resending...' : 'Resend Verification Email'}
            </Button>
          </form>

          <p className="text-center text-sm">
            <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
              Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
