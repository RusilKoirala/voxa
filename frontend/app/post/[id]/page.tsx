'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { postAPI, commentAPI } from '@/lib/api'
import type { Post, Comment, User } from '@/types'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import RightSidebar from '@/components/layout/RightSidebar'
import PostVote from '@/components/PostVote'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Share2, Bookmark, ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { toast } from 'sonner'

export default function PostDetail() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const timeAgo = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const fetchPost = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        postAPI.getById(Number(id)),
        commentAPI.getByPost(Number(id))
      ])
      if (postRes.data.success) setPost(postRes.data.data || null)
      if (commentsRes.data.success) setComments(commentsRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchPost()
  }, [id])

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await commentAPI.create({ content: commentText, postId: Number(id) })
      toast.success('Comment posted!')
      setCommentText('')
      fetchPost()
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    )
  }

  const communityName = post.community?.name || 'community'
  const authorName = post.author?.username || 'user'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex gap-4">
          <Sidebar />
          <div className="flex-1 max-w-2xl space-y-3">
            <Card className="overflow-hidden">
              <div className="flex">
                <PostVote
                  postId={post.id}
                  upvotes={post.upvotes}
                  downvotes={post.downvotes}
                />
                <div className="flex-1 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div
                      className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full cursor-pointer flex-shrink-0"
                      onClick={() => router.push(`/c/${communityName}`)}
                    />
                    <span
                      className="font-medium text-foreground cursor-pointer hover:underline"
                      onClick={() => router.push(`/c/${communityName}`)}
                    >
                      r/{communityName}
                    </span>
                    <span>•</span>
                    <span>Posted by u/{authorName}</span>
                    <span>•</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                  <h1 className="text-xl font-medium mb-3">{post.title}</h1>
                  {post.content && (
                    <p className="text-sm text-muted-foreground mb-4">{post.content}</p>
                  )}
                  {post.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={post.imageUrl}
                        alt="Post image"
                        className="w-full rounded-md max-h-[500px] object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 text-muted-foreground hover:bg-accent px-2 py-1 rounded text-xs font-medium">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comments</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:bg-accent px-2 py-1 rounded text-xs font-medium">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:bg-accent px-2 py-1 rounded text-xs font-medium">
                      <Bookmark className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarFallback className="bg-orange-500 text-white text-xs">
                    {user?.username.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={user ? 'What are your thoughts?' : 'Login to comment'}
                    disabled={!user}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!user || submitting || !commentText.trim()}
                      className="bg-orange-500 hover:bg-orange-600 h-8 text-xs"
                    >
                      {submitting ? 'Posting...' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {'U'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">u/user</span>
                          <span>•</span>
                          <span>{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm mb-2">{comment.content}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <button className="hover:text-orange-500">
                              <ArrowBigUp className="w-4 h-4" />
                            </button>
                            <span className="font-medium">{comment.upvotes - comment.downvotes}</span>
                            <button className="hover:text-blue-500">
                              <ArrowBigDown className="w-4 h-4" />
                            </button>
                          </div>
                          <button className="hover:text-foreground">Reply</button>
                          <button className="hover:text-foreground">Share</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No comments yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
          <RightSidebar />
        </div>
      </main>
    </div>
  )
}
