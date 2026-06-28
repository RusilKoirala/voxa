'use client'

import { Card } from '@/components/ui/card'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  const voteCount = post.upvotes - post.downvotes
  const communityName = post.community?.name || 'community'
  const authorName = post.author?.username || 'user'

  return (
    <Card className="hover:border-gray-300 cursor-pointer">
      <div className="flex">
        <div className="bg-gray-50 p-2 flex flex-col items-center space-y-1 rounded-l-lg border-r border-gray-100">
          <button className="text-gray-400 hover:text-orange-500 hover:bg-gray-200 p-1 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className="text-sm font-bold text-gray-900">
            {voteCount >= 1000 ? `${(voteCount / 1000).toFixed(1)}k` : voteCount}
          </span>
          <button className="text-gray-400 hover:text-blue-500 hover:bg-gray-200 p-1 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="flex-1 p-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full" />
            <span className="font-medium text-gray-900">r/{communityName}</span>
            <span>•</span>
            <span>Posted by u/{authorName}</span>
            <span>•</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
          {post.content && (
            <p className="text-sm text-gray-600 mb-3">
              {post.content}
            </p>
          )}
          {post.imageUrl && (
            <div className="mb-3">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full rounded-lg max-h-96 object-cover"
              />
            </div>
          )}
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">234 Comments</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-sm font-medium">Save</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
