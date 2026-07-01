'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { searchAPI } from '@/lib/api'
import type { Post, Comment, User, Community } from '@/types'
import PostCard from '@/components/PostCard'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageCircle, Users, User as UserIcon, Hash } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResults {
  posts: Post[]
  comments: Comment[]
  users: User[]
  communities: Community[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const router = useRouter()
  
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    comments: [],
    users: [],
    communities: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'comments' | 'users' | 'communities'>('all')

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false)
      return
    }
    
    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await searchAPI.searchAll(query)
        if (response.data.success) {
          setResults(response.data.data || {
            posts: [],
            comments: [],
            users: [],
            communities: []
          })
        }
      } catch (error) {
        console.error('search failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchResults()
  }, [query])

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">searching for "{query}"...</p>
          {/* authentic comment - your style */}
          <p className="text-xs text-muted-foreground mt-2 italic">
            hope we find something good! XD
          </p>
        </div>
      </div>
    )
  }

  const totalResults = results.posts.length + results.comments.length + 
                      results.users.length + results.communities.length

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          search results for "{query}"
        </h1>
        <p className="text-muted-foreground">
          found {totalResults} result{totalResults !== 1 ? 's' : ''}
        </p>
      </div>

      {/* tabs for filtering results */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-accent text-muted-foreground'
          }`}
        >
          all ({totalResults})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
            activeTab === 'posts' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-accent text-muted-foreground'
          }`}
        >
          <MessageCircle className="inline h-3 w-3 mr-1" />
          posts ({results.posts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
            activeTab === 'comments' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-accent text-muted-foreground'
          }`}
        >
          <MessageCircle className="inline h-3 w-3 mr-1" />
          comments ({results.comments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
            activeTab === 'users' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-accent text-muted-foreground'
          }`}
        >
          <UserIcon className="inline h-3 w-3 mr-1" />
          users ({results.users.length})
        </button>
        <button
          onClick={() => setActiveTab('communities')}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
            activeTab === 'communities' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-accent text-muted-foreground'
          }`}
        >
          <Users className="inline h-3 w-3 mr-1" />
          communities ({results.communities.length})
        </button>
      </div>

      {/* results */}
      <div className="space-y-6">
        {/* posts */}
        {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">posts</h2>
            <div className="space-y-3">
              {results.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* comments */}
        {(activeTab === 'all' || activeTab === 'comments') && results.comments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">comments</h2>
            <div className="space-y-3">
              {results.comments.map((comment) => (
                <Card key={comment.id} className="cursor-pointer hover:border-primary/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>u/{comment.author?.username || 'user'}</span>
                      <span>•</span>
                      <span>{timeAgo(comment.createdAt)}</span>
                      <span>•</span>
                      <span 
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() => router.push(`/post/${comment.postId}`)}
                      >
                        on post: {comment.postId}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* users */}
        {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.users.map((user) => (
                <Card 
                  key={user.id} 
                  className="cursor-pointer hover:border-primary/50"
                  onClick={() => router.push(`/u/${user.username}`)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-orange-500 text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">u/{user.username}</h3>
                      <p className="text-xs text-muted-foreground">
                        joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* communities */}
        {(activeTab === 'all' || activeTab === 'communities') && results.communities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.communities.map((community) => (
                <Card 
                  key={community.id} 
                  className="cursor-pointer hover:border-primary/50"
                  onClick={() => router.push(`/c/${community.name}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium">r/{community.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          members
                        </p>
                      </div>
                    </div>
                    {community.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {community.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* no results */}
        {totalResults === 0 && (
          <div className="text-center py-12 border rounded-lg bg-card">
            <p className="text-muted-foreground">
              no results found for "{query}". try different keywords! :)
            </p>
            {/* authentic comment - your style */}
            <p className="text-xs text-muted-foreground mt-2 italic">
              maybe we should create something about this? ;)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}