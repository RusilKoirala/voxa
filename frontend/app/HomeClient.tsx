'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PostCard from '@/components/PostCard'
import CreatePostPrompt from '@/components/CreatePostPrompt'
import { postAPI, communityAPI } from '@/lib/api'
import type { Post, Community, User } from '@/types'

interface HomeClientProps {
  initialUser: User | null
  initialPosts: Post[]
  initialCommunities: Community[]
}

export default function HomeClient({ 
  initialUser, 
  initialPosts, 
  initialCommunities 
}: HomeClientProps) {
  const [user] = useState(initialUser)
  const [posts, setPosts] = useState(initialPosts)
  const [communities] = useState(initialCommunities)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [postsRes, communitiesRes] = await Promise.all([
        postAPI.getAll(),
        communityAPI.getAll()
      ])

      if (postsRes.data.success) {
        setPosts(postsRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-4">
          <Sidebar />
          <div className="flex-1 max-w-xl space-y-3">


            {user && <CreatePostPrompt onPostCreated={fetchData} />}
   
   
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
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
          <RightSidebar />

        </div>
      </main>
    </div>
  )
}