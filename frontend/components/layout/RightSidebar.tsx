'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function RightSidebar() {
  return (
    <aside className="w-80 flex-shrink-0 hidden lg:block">
      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-semibold">Home</h3>
        </CardHeader>
        <CardContent className="text-sm text-gray-500 space-y-2">
          <p>Your personal voxa frontpage.</p>
          <Separator />
          <p>Sign up to get the best out of voxa.</p>
        </CardContent>
      </Card>
    </aside>
  )
}
