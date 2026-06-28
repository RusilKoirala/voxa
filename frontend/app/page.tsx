'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PostCard from '@/components/PostCard'
import CreatePostPrompt from '@/components/CreatePostPrompt'
import WelcomeCard from '@/components/WelcomeCard'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <Sidebar />
          <div className="flex-1 max-w-2xl space-y-4">
            {user ? (
              <>
                <CreatePostPrompt onPostCreated={fetchData} />
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No posts yet. Be the first to post!</p>
                  </div>
                )}
              </>
            ) : (
              <WelcomeCard />
            )}
          </div>
          <RightSidebar />
        </div>
      </main>
    </div>
  )
}
