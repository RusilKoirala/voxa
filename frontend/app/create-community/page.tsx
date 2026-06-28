'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Image } from 'lucide-react'
import Link from 'next/link'
import { communityAPI } from '@/lib/api'

export default function CreateCommunityPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Community name is required')
      return
    }

    if (name.length > 21) {
      toast.error('Community name must be 21 characters or less')
      return
    }

    setLoading(true)
    try {
      const response = await communityAPI.create({
        name: name.trim(),
        description: description.trim() || undefined
      })

      if (response.data.success) {
        toast.success('Community created!')
        router.push('/')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create community')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Create a community</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">r/</span>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-8"
                    placeholder="community_name"
                    maxLength={21}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  21 characters max. No spaces. Only letters, numbers, and underscores.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Community icon (optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 cursor-pointer transition-colors">
                  <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload image</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your community"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create community'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
