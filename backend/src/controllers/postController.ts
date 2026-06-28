import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { posts, communityMembers } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

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

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: communityPosts
    })
  } catch (error) {
    console.error('Get posts by community error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

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

    res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: post
    })
  } catch (error) {
    console.error('Get post by id error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

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

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const allPosts = await db.query.posts.findMany({
      with: {
        author: true,
        community: true
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)]
    })

    res.status(200).json({
      success: true,
      message: 'All posts fetched successfully',
      data: allPosts
    })
  } catch (error) {
    console.error('Get all posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
