import axios from 'axios'
import type { User, Community, Post, Comment, ApiResponse , UserProfile} from '@/types'


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})
// User API

export const userAPI = {
    getByUsername: (username: string)=> 
        api.get<ApiResponse<UserProfile>>(`/users/${username}`)
}



// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post<ApiResponse<{ user: User }>>('/auth/login', { email, password }),

    register: (username: string, email: string, password: string) =>
        api.post<ApiResponse<{ user: User }>>('/auth/register', { username, email, password }),

    logout: () =>
        api.post<ApiResponse<void>>('/auth/logout'),

    getMe: () =>
        api.get<ApiResponse<User>>('/auth/me')
}

// Community API
export const communityAPI = {
    getAll: () =>
        api.get<ApiResponse<Community[]>>('/communities'),

    getById: (id: number) =>
        api.get<ApiResponse<Community>>(`/communities/${id}`),

    create: (data: { name: string; description?: string; icon?: string; banner?: string }) =>
        api.post<ApiResponse<Community>>('/communities', data),

    join: (id: number) =>
        api.post<ApiResponse<void>>(`/communities/${id}/join`),

    leave: (id: number) =>
        api.post<ApiResponse<void>>(`/communities/${id}/leave`),

    getMembers: (id: number) =>
        api.get<ApiResponse<any[]>>(`/communities/${id}/members`),

    checkMembership: (id: number) =>
        api.get<ApiResponse<boolean>>(`/communities/${id}/membership`)
}

// Post API
export const postAPI = {
    getAll: () =>
        api.get<ApiResponse<Post[]>>('/posts'),

    getByCommunity: (communityId: number) =>
        api.get<ApiResponse<Post[]>>(`/posts/community/${communityId}`),

    getById: (id: number) =>
        api.get<ApiResponse<Post>>(`/posts/${id}`),

    create: (data: { title: string; content?: string; imageUrl?: string; communityId: number }) =>
        api.post<ApiResponse<Post>>('/posts', data),

    update: (id: number, data: { title?: string; content?: string; imageUrl?: string }) =>
        api.put<ApiResponse<Post>>(`/posts/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/posts/${id}`)
}

// Comment API
export const commentAPI = {
    getByPost: (postId: number) =>
        api.get<ApiResponse<Comment[]>>(`/comments/post/${postId}`),

    getById: (id: number) =>
        api.get<ApiResponse<Comment>>(`/comments/${id}`),

    create: (data: { content: string; postId: number; parentId?: number }) =>
        api.post<ApiResponse<Comment>>('/comments', data),

    update: (id: number, data: { content: string }) =>
        api.put<ApiResponse<Comment>>(`/comments/${id}`, data),

    delete: (id: number) =>
        api.delete<ApiResponse<void>>(`/comments/${id}`)
}

// Vote API
export const voteAPI = {
    votePost: (postId: number, value: number) =>
        api.post<ApiResponse<void>>('/votes/post', { postId, value }),

    voteComment: (commentId: number, value: number) =>
        api.post<ApiResponse<void>>('/votes/comment', { commentId, value }),

    removePostVote: (postId: number) =>
        api.delete<ApiResponse<void>>(`/votes/post/${postId}`),

    removeCommentVote: (commentId: number) =>
        api.delete<ApiResponse<void>>(`/votes/comment/${commentId}`)
}

export default api
