'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import Link from 'next/link'

export default function WelcomeCard() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to voxa</h2>
        <p className="text-gray-500 mb-6">Sign up to share content and join communities.</p>
        <div className="flex space-x-3 justify-center">
          <Link href="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-orange-500 hover:bg-orange-600">Sign Up</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
