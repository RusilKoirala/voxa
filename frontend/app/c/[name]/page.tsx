'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PostCard from '@/components/PostCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { communityAPI, postAPI } from '@/lib/api'
import type { Community, Post } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import PostForm from '@/components/PostForm'

export default function CommunityPage() {
  const params = useParams()
  const communityName = params.name as string
  const { user } = useAuth()

  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(false)

  useEffect(() => {
    if (!communityName) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityName])

  const fetchData = async () => {
    setLoading(true)
    try {
      const communitiesRes = await communityAPI.getAll()
      const communities = communitiesRes.data.data || []
      const foundCommunity = communities.find(c => c.name === communityName)

      if (foundCommunity) {
        setCommunity(foundCommunity)

        if (user && foundCommunity.creatorId === user.id) {
          setIsCreator(true)
          setIsMember(true)
        } else {
          setIsCreator(false)
          await checkMembership(foundCommunity.id)
        }

        const postsRes = await postAPI.getByCommunity(foundCommunity.id)
        setPosts(postsRes.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkMembership = async (communityId: number) => {
    try {
      const res = await communityAPI.checkMembership(communityId)
      if (res.data.success) {
        setIsMember(Boolean(res.data.data))
      } else {
        setIsMember(false)
      }
    } catch (error: any) {
      // 401 = not logged in → definitely not a member
      if (error?.response?.status === 401) {
        setIsMember(false)
        return
      }
      console.error('Failed to check membership:', error)
      setIsMember(false)
    }
  }

  const handleJoinCommunity = async () => {
    if (!community) return
    if (!user) {
      toast.error('Please sign in to join')
      return
    }
    setMembershipLoading(true)
    setIsMember(true)
    try {
      await communityAPI.join(community.id)
      toast.success('Joined community!')
    } catch (error) {
      setIsMember(false)
      toast.error('Failed to join community')
    } finally {
      setMembershipLoading(false)
    }
  }

  const handleLeaveCommunity = async () => {
    if (!community || isCreator) return
    setMembershipLoading(true)
    setIsMember(false)
    try {
      await communityAPI.leave(community.id)
      toast.success('Left community')
    } catch (error) {
      setIsMember(true)
      toast.error('Failed to leave community')
    } finally {
      setMembershipLoading(false)
    }
  }

  const refreshPosts = () => {
    fetchData()
  }

  const renderJoinButton = () => {
    if (!user) {
      return (
        <Button
          variant="outline"
          className="h-9"
          onClick={() => toast.message('Sign in to join communities')}
        >
          Join
        </Button>
      )
    }

    if (isCreator) {
      return null
    }

    if (isMember) {
      return (
        <Button
          variant="outline"
          className="h-9 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
          onClick={handleLeaveCommunity}
          disabled={membershipLoading}
        >
          {membershipLoading ? 'Leaving...' : 'Joined'}
        </Button>
      )
    }

    return (
      <Button
        className="bg-orange-500 hover:bg-orange-600 h-9"
        onClick={handleJoinCommunity}
        disabled={membershipLoading}
      >
        {membershipLoading ? 'Joining...' : 'Join'}
      </Button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-4">
          <Sidebar />
          <div className="flex-1 max-w-xl space-y-3">
            {/* Community Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold truncate">r/{community.name}</h1>
                    {community.description && (
                      <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                    )}
                  </div>
                  {renderJoinButton()}
                </div>
              </CardContent>
            </Card>

            {/* Create Post Prompt */}
            {user && (
              showPostForm ? (
                <PostForm
                  onCancel={() => setShowPostForm(false)}
                  onSuccess={() => {
                    setShowPostForm(false)
                    refreshPosts()
                  }}
                  communityId={community.id}
                />
              ) : (
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <button
                        onClick={() => setShowPostForm(true)}
                        className="flex-1 px-4 py-2 border rounded-full bg-muted hover:bg-accent text-left text-muted-foreground transition-colors"
                      >
                        Create Post
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            {/* Posts List */}
            {posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={{ ...post, community }} />
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