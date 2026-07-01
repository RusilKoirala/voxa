'use client'

import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types'
import PostVote from './PostVote'
import { MessageCircle, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter()

  // time ago function - like reddit shows
  const timeAgo = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  // share function - for sharing posts
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: url,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('link copied! :D')
      })
    }
  }

  const communityName = post.community?.name || 'community'
  const authorName = post.author?.username || 'user'

  return (
    <Card className="cursor-pointer overflow-hidden hover:border-primary/30 transition-colors border-l-4 border-l-orange-500">
      <div className="flex">
        <div className="w-12 flex-shrink-0 bg-muted/30 flex flex-col items-center pt-3">
          <PostVote
            postId={post.id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote ?? 0}
          />
        </div>
        
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div
              className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full cursor-pointer flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/c/${communityName}`)
              }}
            >
              {communityName.charAt(0).toUpperCase()}
            </div>
            <span
              className="font-medium text-foreground cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/c/${communityName}`)
              }}
            >
              r/{communityName}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">posted by u/{authorName}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{timeAgo(post.createdAt)}</span>
            
            {post.upvotes > 10 && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                trending
              </span>
            )}
          </div>
          
          <h3 
            className="text-lg font-semibold mb-3 cursor-pointer hover:text-orange-500 transition-colors" 
            onClick={() => router.push(`/post/${post.id}`)}
          >
            {post.title}
          </h3>
          
          {post.content && (
            <div className="mb-4">
              <p className="text-sm text-foreground/90 bg-muted/20 p-3 rounded-md border">
                {post.content}
              </p>
            </div>
          )}
          
          {post.imageUrl && (
            <div className="mb-4">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full rounded-lg max-h-96 object-cover border"
              />
            </div>
          )}
          
          <div className="flex items-center gap-1 pt-2 border-t">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/post/${post.id}`)
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:bg-accent px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentCount || 0} comments</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-muted-foreground hover:bg-accent px-3 py-1.5 rounded-md text-sm font-medium transition-colors ml-2"
            >
              <Share2 className="h-4 w-4" />
              <span>share</span>
            </button>
            
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {post.upvotes} upvotes • {post.downvotes} downvotes
              </span>
              <span className="sm:hidden">
                {post.upvotes}↑ {post.downvotes}↓
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}