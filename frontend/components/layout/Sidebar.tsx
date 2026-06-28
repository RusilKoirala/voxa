'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { communityAPI } from '@/lib/api'
import type { Community } from '@/types'

export default function Sidebar() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

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
    <aside className="w-64 flex-shrink-0 hidden md:block space-y-4">
      <Card>
        <CardContent className="p-4">
          <Link href="/create-community">
            <Button className="w-full bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm font-medium text-gray-500">Popular Communities</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : communities.length > 0 ? (
            communities.map((community) => (
              <div
                key={community.id}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {community.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">r/{community.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No communities yet</p>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}
