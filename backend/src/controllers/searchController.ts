// backend/src/controllers/searchController.ts
import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { ilike, or } from 'drizzle-orm'

// search controller - simplified version
export const searchAll = async (req: Request, res: Response) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'search query is required :('
      })
    }

    const searchTerm = `%${q}%`

    // Search posts
    const postResults = await db.query.posts.findMany({
      where: (posts, { or }) => 
        or(
          ilike(posts.title, searchTerm),
          ilike(posts.content, searchTerm)
        ),
      with: {
        author: true,
        community: true
      },
      limit: 20
    })

    // Search comments
    const commentResults = await db.query.comments.findMany({
      where: (comments, { ilike }) => ilike(comments.content, searchTerm),
      with: {
        author: true
      },
      limit: 20
    })

    // Search users
    const userResults = await db.query.users.findMany({
      where: (users, { or }) => 
        or(
          ilike(users.username, searchTerm),
          ilike(users.bio, searchTerm)
        ),
      limit: 20
    })

    // Search communities
    const communityResults = await db.query.communities.findMany({
      where: (communities, { or }) => 
        or(
          ilike(communities.name, searchTerm),
          ilike(communities.description, searchTerm)
        ),
      limit: 20
    })

    res.status(200).json({
      success: true,
      message: 'search successful! :D',
      data: {
        posts: postResults,
        comments: commentResults,
        users: userResults,
        communities: communityResults
      }
    })
  } catch (error) {
    console.error('search error:', error)
    res.status(500).json({
      success: false,
      message: 'internal server error :('
    })
  }
}