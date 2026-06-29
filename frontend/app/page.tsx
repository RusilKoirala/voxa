'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PostCard from '@/components/PostCard'
import CreatePostPrompt from '@/components/CreatePostPrompt'
import { postAPI, communityAPI } from '@/lib/api'
import type { Post, Community } from '@/types'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [postsRes, communitiesRes] = await Promise.all([
        postAPI.getAll(),
        communityAPI.getAll()
      ])

      if (postsRes.data.success) {
        setPosts(postsRes.data.data || [])
      }

      if (communitiesRes.data.success) {
        setCommunities(communitiesRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
      <div className="flex gap-4">
        <div className="flex-1 max-w-xl space-y-3">
          {user && <CreatePostPrompt onPostCreated={fetchData} />}
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
