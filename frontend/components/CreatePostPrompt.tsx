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
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-orange-500 text-white">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 px-4 py-2 border rounded-full bg-muted hover:bg-accent text-left text-muted-foreground transition-colors"
          >
            Create Post
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
