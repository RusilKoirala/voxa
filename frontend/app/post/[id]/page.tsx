'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { postAPI, commentAPI } from '@/lib/api'
import type { Post, Comment, User } from '@/types'
import PostVote from '@/components/PostVote'
import CommentVote from '@/components/CommentVote'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Share2, X } from 'lucide-react'
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
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

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

  const handleSubmitReply = async (parentId: number) => {
    if (!user) {
      toast.error('Please login to reply')
      return
    }
    if (!replyText.trim()) return
    setSubmittingReply(true)
    try {
      await commentAPI.create({ content: replyText, postId: Number(id), parentId })
      toast.success('Reply posted!')
      setReplyText('')
      setReplyingTo(null)
      fetchPost()
    } catch (error) {
      toast.error('Failed to post reply')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: url,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard!')
      })
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

  // Recursive function to render comments and all replies
  const renderComment = (comment: any) => {
    const commentReplies = comments.filter(c => c.parentId === comment.id)
    return (
      <div key={comment.id} className="space-y-2">
        <Card className={comment.parentId ? "p-3" : "p-4"}>
          <div className="flex gap-3">
            <CommentVote
              commentId={comment.id}
              upvotes={comment.upvotes}
              downvotes={comment.downvotes}
              userVote={comment.userVote ?? 0}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Avatar className={comment.parentId ? "h-5 w-5" : "h-6 w-6"}>
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {(comment as any).author?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">u/{(comment as any).author?.username || 'user'}</span>
                <span>•</span>
                <span>{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-sm mb-2">{comment.content}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="hover:text-foreground flex items-center gap-1"
                >
                  Reply
                </button>
                <button
                  onClick={handleShare}
                  className="hover:text-foreground flex items-center gap-1"
                >
                  Share
                </button>
              </div>
              {replyingTo === comment.id && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="text-sm h-8"
                  />
                  <Button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submittingReply || !replyText.trim()}
                    className="bg-orange-500 hover:bg-orange-600 h-8 text-xs"
                  >
                    {submittingReply ? 'Posting...' : 'Reply'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Render replies recursively */}
        {commentReplies.length > 0 && (
          <div className="ml-10 space-y-2">
            {commentReplies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    )
  }

  const topLevelComments = comments.filter(c => !c.parentId)

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-3">
      <Card className="overflow-hidden">
        <div className="flex">
          <PostVote
            postId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote ?? 0}
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
                <span>{comments.length} Comments</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-muted-foreground hover:bg-accent px-2 py-1 rounded text-xs font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
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
        {topLevelComments.length > 0 ? (
          topLevelComments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
