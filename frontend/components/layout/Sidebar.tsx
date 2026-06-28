'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { communityAPI } from '@/lib/api'
import type { Community } from '@/types'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Sidebar() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await communityAPI.getAll()
      if (response.data.success) {
        setCommunities(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="w-56 flex-shrink-0 hidden md:block space-y-3">
      {user && (
        <Card>
          <CardContent className="p-3">
            <Link href="/create-community">
              <Button className="w-full h-9 bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-1" />
                Create Community
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2 px-3 pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Popular Communities</p>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pb-3">
          {loading ? (
            <p className="text-sm text-muted-foreground px-1">Loading...</p>
          ) : communities.length > 0 ? (
            communities.map((community) => (
              <div
                key={community.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                onClick={() => router.push(`/c/${community.name}`)}
              >
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {community.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium truncate">r/{community.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground px-1">No communities yet</p>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
