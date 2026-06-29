// backend/src/controllers/searchController.ts
import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { posts, comments, users, communities } from '../db/schema.js'
import { ilike, or, desc, asc, sql } from 'drizzle-orm'

export const searchAll = async (req: Request, res: Response) => {
  try {
    const { q, type, sort = 'relevance', page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const searchTerm = `%${q}%`

    // Search posts
    const postResults = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      type: sql`'post'`,
      createdAt: posts.createdAt,
      relevance: sql`ts_rank(to_tsvector('english', ${posts.title} || ' ' || ${posts.content}), plainto_tsquery('english', ${q}))`
    })
    .from(posts)
    .where(
      or(
        ilike(posts.title, searchTerm),
        ilike(posts.content, searchTerm)
      )
    )
    .orderBy(desc(sql`relevance`))
    .limit(Number(limit))
    .offset(offset)

    // Search comments
    const commentResults = await db.select({
      id: comments.id,
      content: comments.content,
      type: sql`'comment'`,
      createdAt: comments.createdAt,
      relevance: sql`ts_rank(to_tsvector('english', ${comments.content}), plainto_tsquery('english', ${q}))`
    })
    .from(comments)
    .where(ilike(comments.content, searchTerm))
    .orderBy(desc(sql`relevance`))
    .limit(Number(limit))
    .offset(offset)

    // Search users
    const userResults = await db.select({
      id: users.id,
      username: users.username,
      bio: users.bio,
      type: sql`'user'`,
      createdAt: users.createdAt
    })
    .from(users)
    .where(
      or(
        ilike(users.username, searchTerm),
        ilike(users.bio, searchTerm)
      )
    )
    .limit(Number(limit))
    .offset(offset)

    // Search communities
    const communityResults = await db.select({
      id: communities.id,
      name: communities.name,
      description: communities.description,
      type: sql`'community'`,
      createdAt: communities.createdAt
    })
    .from(communities)
    .where(
      or(
        ilike(communities.name, searchTerm),
        ilike(communities.description, searchTerm)
      )
    )
    .limit(Number(limit))
    .offset(offset)

    const results = [...postResults, ...commentResults, ...userResults, ...communityResults]
    
    // Sort by relevance if mixed results
    if (sort === 'relevance') {
      results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    } else if (sort === 'newest') {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: results.length
        }
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
