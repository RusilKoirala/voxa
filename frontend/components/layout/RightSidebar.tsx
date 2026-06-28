'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'

export default function RightSidebar() {
  const { user } = useAuth()

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <Card>
        <CardHeader className="pb-2 px-3 pt-3">
          <h3 className="text-sm font-semibold">Home</h3>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2 px-3 pb-3">
          <p>Your personal voxa frontpage.</p>
          <Separator />
          {!user && <p>Sign up to get the best out of voxa.</p>}
        </CardContent>
      </Card>
    </aside>
  )
}
