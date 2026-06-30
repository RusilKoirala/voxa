import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { posts, communityMembers } from '../db/schema.js'
import { eq, and,sql, ilike, or } from 'drizzle-orm'
import { attachUserVoteToPost, attachUserVoteToPosts } from '../utils/voteEnrichment.js'

// create Post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, imageUrl, communityId } = req.body

    if (!title || !communityId) {
      return res.status(400).json({
        success: false,
        message: 'Title and community ID are required'
      })
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const isMember = await db.select().from(communityMembers).where(
      and(
        eq(communityMembers.userId, req.userId),
        eq(communityMembers.communityId, communityId)
      )
    ).limit(1)

    if (isMember.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the community to post'
      })
    }

    const newPost = await db.insert(posts).values({
      title,
      content,
      imageUrl,
      authorId: req.userId,
      communityId
    }).returning()

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost[0]
    })

  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// get Post by community
export const getPostsByCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params

    const communityPosts = await db.query.posts.findMany({
      where: eq(posts.communityId, parseInt(communityId)),
      with: {
        author: true,
        community: true
      }
    })

    const enriched = await attachUserVoteToPosts(communityPosts, req.userId)

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: enriched
    })
  } catch (error) {
    console.error('Get posts by community error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// give post by id
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(id)),
      with: {
        author: true,
        community: true
      }
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    const enriched = await attachUserVoteToPost(post, req.userId)

    res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: enriched
    })
  } catch (error) {
    console.error('Get post by id error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// update post data
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, imageUrl } = req.body

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(id))
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    if (post.authorId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      })
    }

    const updatedPost = await db.update(posts).set({
      title: title || post.title,
      content: content !== undefined ? content : post.content,
      imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl,
      updatedAt: new Date()
    }).where(eq(posts.id, parseInt(id))).returning()

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost[0]
    })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}


// delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, parseInt(id))
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    if (post.authorId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      })
    }

    await db.delete(posts).where(eq(posts.id, parseInt(id)))

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// get all posts
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const allPosts = await db.query.posts.findMany({
      with: {
        author: true,
        community: true
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    })

    const enriched = await attachUserVoteToPosts(allPosts, req.userId)

    res.status(200).json({
      success: true,
      message: 'All posts fetched successfully',
      data: enriched
    })
  } catch (error) {
    console.error('Get all posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// get trending posts
export const getTrendingPosts = async(req:Request, res: Response)=> {
  try {
    const { timeRange = 'day', limit=20 } = req.query

    let timeFilter = sql`1=1`
    const now = new Date()

    if(timeRange === 'day') 
    {
      timeFilter = sql`${posts.createdAt} > ${new Date(now.getTime()- 24 * 60 * 60 * 1000)}`
    } else if (timeRange === 'week') 
    {
      timeFilter = sql`${posts.createdAt}> ${new Date(now.getTime()- 7 * 24 * 60 * 60 * 1000)}`
    } else if (timeRange === 'month') {
      timeFilter = sql`${posts.createdAt}> ${new Date(now.getTime()- 30 * 24 * 60 * 60 * 1000 )}`
    }

    const trendingPosts = await db.select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      upvotes: posts.upvotes,
      downvotes: posts.downvotes,
      createPost: posts.createdAt,
      authorId: posts.authorId,
      score: sql<number> `(${posts.upvotes}- ${posts.downvotes}) / EXTRACT(EPOCH FROM (NOW()- ${posts.createdAt}) + INTERNAL '2 hours')`
    })
    .from(posts)
    .where(timeFilter)
    .orderBy(desc(sql`score`))
    .limit(Number(limit))

    let enrichedPosts = trendingPosts
    if (req.userId) 
    {
      enrichedPosts = await attachUserVoteToPosts(trendingPosts, req.userId)
    }

    res.status(200).json({
      success: true,
      data: enrichedPosts
    })
  } catch (error) {
    console.error('Trending posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// search posts
export const searchPosts = async (req: Request, res: Response) => {
    try {
      const { q, page= 1, limit = 20} = req.query
      const offset = (Number(page) - 1)*Number(limit)

      if (!q || typeof q !== 'string') 
      {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        })
      }

      const searchTerm = `%${q}%`
      
      const results = await db.select()
        .from(posts)
        .where(
          or(
            ilike(posts.title, searchTerm),
            ilike(posts.content, searchTerm)
          )
        ).limit(Number(limit))
        .offset(offset)
        .orderBy(desc(posts.createdAt))

        const total = await db.select({ count: count() })
          .from(posts)
          .where(
          or(
            ilike(posts.title, searchTerm),
            ilike(posts.content, searchTerm)
          )
        )

        res.status(200).json({
          success: true,
          data: {
            results,
            pagination: {
            page: Number(page),
            limit: Number(limit),
            total: total[0].count
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