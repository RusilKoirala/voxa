'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Image, Loader2, Trash2 } from 'lucide-react'
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
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // upload to our backend (no CORS issues!)
    setUploadingImage(true)
    try {
      const response = await postAPI.uploadImage(file)
      if (response.data.success && response.data.data) {
        setImageUrl(response.data.data.url)
        toast.success('Image uploaded!')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImageUrl(undefined)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
        imageUrl,
        communityId: selectedCommunityId
      })

      if (response.data.success) {
        toast.success('Post created!')
        setTitle('')
        setContent('')
        setImageUrl(undefined)
        setImagePreview(null)
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
                className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2"
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

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              {!uploadingImage && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
          )}

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
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={uploadingImage}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Image className="w-4 h-4 mr-2" />
              )}
              Image
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={loading || uploadingImage}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}