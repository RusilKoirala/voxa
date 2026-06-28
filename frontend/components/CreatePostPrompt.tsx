'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import PostForm from './PostForm'

interface CreatePostPromptProps {
  onPostCreated?: () => void
}

export default function CreatePostPrompt({ onPostCreated }: CreatePostPromptProps) {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)

  if (!user) return null

  if (showForm) {
    return (
      <PostForm
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false)
          if (onPostCreated) onPostCreated()
        }}
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-orange-500 text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-gray-100 hover:bg-white text-left text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Post
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
