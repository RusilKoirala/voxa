'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PostCard from '@/components/PostCard'
import CreatePostPrompt from '@/components/CreatePostPrompt'
import { postAPI, communityAPI } from '@/lib/api'
import type { Post, Community } from '@/types'

type SortType = 'hot' | 'new' | 'top' | 'rising'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('new')

  const fetchData = async (sortType: SortType = 'new') => {
    setLoading(true)
    try {
      let postsRes
      
      // fetch posts based on sort type - like reddit
      switch(sortType) {
        case 'hot':
          postsRes = await postAPI.getHot()
          break
        case 'new':
          postsRes = await postAPI.getNew()
          break
        case 'top':
          postsRes = await postAPI.getTop()
          break
        case 'rising':
          postsRes = await postAPI.getRising()
          break
        default:
          postsRes = await postAPI.getAll()
      }

      const communitiesRes = await communityAPI.getAll()

      if (postsRes.data.success) {
        setPosts(postsRes.data.data || [])
      }

      if (communitiesRes.data.success) {
        setCommunities(communitiesRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // fallback to all posts if sorting fails
      try {
        const fallbackRes = await postAPI.getAll()
        if (fallbackRes.data.success) {
          setPosts(fallbackRes.data.data || [])
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(sortBy)
  }, [sortBy])

  const handleSortChange = (newSort: SortType) => {
    setSortBy(newSort)
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">loading posts... :)</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
      <div className="flex gap-6">
        {/* main content area - like reddit feed */}
        <div className="flex-1 max-w-3xl space-y-4">
          {user && <CreatePostPrompt onPostCreated={fetchData} />}
          
          {/* sorting options - like reddit has hot, new, top etc */}
          <div className="bg-card border rounded-lg p-2 flex gap-2">
            <button 
              onClick={() => handleSortChange('hot')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'hot' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              hot
            </button>
            <button 
              onClick={() => handleSortChange('new')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'new' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              new
            </button>
            <button 
              onClick={() => handleSortChange('top')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'top' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              top
            </button>
            <button 
              onClick={() => handleSortChange('rising')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'rising' 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-accent text-muted-foreground'
              }`}
            >
              rising
            </button>
          </div>
          
          {/* posts feed */}
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-card">
              <p className="text-muted-foreground">no posts yet. be the first to post! :D</p>
              {user && (
                <button 
                  onClick={() => {/* we'll add this later */}}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium"
                >
                  create your first post
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* right sidebar area - for trending posts etc */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          {/* trending communities card */}
          <div className="bg-card border rounded-lg mb-4">
            <div className="p-3 border-b">
              <h3 className="font-medium text-sm">trending communities</h3>
            </div>
            <div className="p-3 space-y-2">
              {communities.slice(0, 5).map((community) => (
                <div 
                  key={community.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => window.location.href = `/c/${community.name}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">r/{community.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {community.description || 'no description yet'}
                    </p>
                  </div>
                </div>
              ))}
              {communities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  no communities yet. create one! :)
                </p>
              )}
            </div>
          </div>
          
          {/* about voxa card */}
          <div className="bg-card border rounded-lg">
            <div className="p-3 border-b">
              <h3 className="font-medium text-sm">about voxa</h3>
            </div>
            <div className="p-3 space-y-3">
              <p className="text-sm text-muted-foreground">
                voxa is a reddit-like platform where you can create communities, share posts, and discuss with others. 
                built as a learning project for full-stack development.
              </p>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  created by <span className="font-medium text-foreground">rusil</span> • {new Date().getFullYear()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  this project is for #horizons hack club program :)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
