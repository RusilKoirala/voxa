'use client'

import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types'
import PostVote from './PostVote'
import { MessageCircle, Share2, Bookmark } from 'lucide-react'
import { toast } from 'sonner'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter()

  const timeAgo = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

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
        toast.success('Link copied to clipboard!')
      })
    }
  }

  const communityName = post.community?.name || 'community'
  const authorName = post.author?.username || 'user'

  return (
    <Card className="cursor-pointer overflow-hidden hover:border-primary/50 transition-colors">
      <div className="flex">
        <PostVote
          postId={post.id}
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote ?? 0}
        />
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <div
              className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full cursor-pointer flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/c/${communityName}`)
              }}
            />
            <span
              className="font-medium text-foreground cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/c/${communityName}`)
              }}
            >
              r/{communityName}
            </span>
            <span>•</span>
            <span>Posted by u/{authorName}</span>
            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
          <h3 className="text-base font-medium mb-2" onClick={() => router.push(`/post/${post.id}`)}>
            {post.title}
          </h3>
          {post.content && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>
          )}
          {post.imageUrl && (
            <div className="mb-3">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full rounded-md max-h-96 object-cover"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/post/${post.id}`)
              }}
              className="flex items-center gap-2 text-muted-foreground hover:bg-accent px-2 py-1 rounded text-xs font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Comments</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-muted-foreground hover:bg-accent px-2 py-1 rounded text-xs font-medium"
            >
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
  )
}
