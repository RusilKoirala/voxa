'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Image } from 'lucide-react'
import { toast } from 'sonner'
import { postAPI, communityAPI } from '@/lib/api'
import type { Community } from '@/types'

interface PostFormProps {
  onCancel: () => void
  onSuccess?: () => void
  communityId?: number
}

export default function PostForm({ onCancel, onSuccess, communityId }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | undefined>(communityId)
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCommunities, setLoadingCommunities] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await communityAPI.getAll()
      if (response.data.success && response.data.data) {
        setCommunities(response.data.data)
        if (!communityId && response.data.data.length > 0) {
          setSelectedCommunityId(response.data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setLoadingCommunities(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!selectedCommunityId) {
      toast.error('Please select a community')
      return
    }

    setLoading(true)
    try {
      const response = await postAPI.create({
        title,
        content: content.trim() || undefined,
        communityId: selectedCommunityId
      })

      if (response.data.success) {
        toast.success('Post created!')
        setTitle('')
        setContent('')
        onCancel()
        if (onSuccess) onSuccess()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create a post</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Community</Label>
            {loadingCommunities ? (
              <Input disabled placeholder="Loading communities..." />
            ) : (
              <select
                id="community"
                value={selectedCommunityId || ''}
                onChange={(e) => setSelectedCommunityId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                <option value="">Select a community</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    r/{community.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Text (optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Text (optional)"
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter className="border-t p-4 flex justify-between">
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" size="sm">
              <Image className="w-4 h-4 mr-2" />
              Image
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
