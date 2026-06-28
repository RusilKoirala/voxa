'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { userAPI } from '@/lib/api'
import type { UserProfile } from '@/types'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PostCard from '@/components/PostCard'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, FileText, Award, Calendar } from 'lucide-react'

type Tab = 'posts' | 'comments'


export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const [tab, setTab] = useState<Tab>('posts')

  useEffect(() => {
    if (!username) return
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getByUsername(username)
        if (res.data.success) setProfile(res.data.data || null)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  const formatJoinDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const timeAgo = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-muted-foreground">User not found</p>
        </main>
      </div>
    )
  }

  const { user, karma, postCount, commentCount, posts, comments } = profile

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-4">
          <Sidebar />
          <div className="flex-1 max-w-2xl space-y-3">
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-orange-500 text-white text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3 min-w-0">
                  <h1 className="text-2xl font-semibold">u/{user.username}</h1>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground">{user.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-foreground">{karma.toLocaleString()}</span>
                      <span>karma</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium text-foreground">{postCount}</span>
                      <span>posts</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium text-foreground">{commentCount}</span>
                      <span>comments</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatJoinDate(user.createdAt)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-1 border-b border-border">
              <button
                onClick={() => setTab('posts')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'posts'
                    ? 'border-orange-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Posts ({postCount})
              </button>
              <button
                onClick={() => setTab('comments')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'comments'
                    ? 'border-orange-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Comments ({commentCount})
              </button>
            </div>

            {tab === 'posts' && (
              <div className="space-y-3">
                {posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <Card className="p-8 text-center text-sm text-muted-foreground">
                    No posts yet.
                  </Card>
                )}
              </div>
            )}

            {tab === 'comments' && (
              <div className="space-y-3">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <Card key={comment.id} className="p-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Commented on{' '}
                        <span className="text-foreground font-medium">
                          {comment.post?.title || 'a post'}
                        </span>{' '}
                        in r/{comment.post?.community?.name || 'community'}
                        {' • '}
                        {timeAgo(comment.createdAt)}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        <span>↑ {comment.upvotes}</span>
                        <span>↓ {comment.downvotes}</span>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center text-sm text-muted-foreground">
                    No comments yet.
                  </Card>
                )}
              </div>
            )}
          </div>
          <RightSidebar />
        </div>
      </main>
    </div>
  )
}