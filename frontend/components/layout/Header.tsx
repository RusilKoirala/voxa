'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Bell, Plus, LogOut, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '../ui/theme-toggle'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('enter something to search! :D')
      // authentic comment - your style
      toast.info('like, anything at all! XD')
      return
    }
    
    // navigate to search page with query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">voxa</span>
            </Link>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="search voxa..."
                  className="pl-9 h-9 rounded-full bg-muted border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  search
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button asChild className="bg-orange-500 hover:bg-orange-600 h-9">
                  <Link href="/create-community">
                    <Plus className="h-4 w-4 mr-1" />
                    create
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-orange-500 text-white text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-3 border-b">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-orange-500 text-white text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm" className="h-9">
                  <Link href="/login">log in</Link>
                </Button>
                <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 h-9">
                  <Link href="/register">sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
