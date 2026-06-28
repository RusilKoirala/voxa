export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface Community {
  id: number
  name: string
  description?: string
  icon?: string
  banner?: string
  creatorId: number
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: number
  title: string
  content?: string
  imageUrl?: string
  authorId: number
  communityId: number
  upvotes: number
  downvotes: number
  createdAt: Date
  updatedAt: Date
  author?: User
  community?: Community
}

export interface Comment {
  id: number
  content: string
  authorId: number
  postId: number
  parentId?: number
  upvotes: number
  downvotes: number
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface UserProfile {
    user: {
        id: number
        username: string
        avatar?: string
        bio?: string
        createdAt: Date
    }
    karma: number
    postCount: number
    commentCount: number
    posts: Post[]
    comments: (Comment & {
        post?: Post & { community?: Community
        }
    }) []
}