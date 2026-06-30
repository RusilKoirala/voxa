import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { votes, posts, comments } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'


// ---- votePost ---
export const votePost = async (req: Request, res: Response) => {
  try {
    const { postId, value } = req.body

    // some condition so user dont be naughty
    if (!postId || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and vote value are required'
      })
    }

    if (value !== 1 && value !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Vote value must be 1 (upvote) or -1 (downvote)'
      })
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }



    // getting some valuee
    const postIdNum = parseInt(postId)
    const numericValue = Number(value)

    const post = await db.select().from(posts).where(
      eq(posts.id, postIdNum)
    ).limit(1)

    if (post.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      })
    }

    // find existing vote
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, req.userId),
        eq(votes.postId, postIdNum)
      )
    ).limit(1)

    // putting condition on length
    if (existingVote.length > 0) {
      await db.update(votes).set({
        value: numericValue
      }).where(eq(votes.id, existingVote[0].id))
    } else {
      await db.insert(votes).values({
        userId: req.userId,
        postId: postIdNum,
        value: numericValue
      })
    }

    // calculate votes
    await recalculatePostVotes(postIdNum)


    // send success message
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully'
    })

  } catch (error) {
    // send error and log it
    console.error('Vote post error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}


// --- voteComment ---
export const voteComment = async (req: Request, res: Response) => {
  try {
    const { commentId, value } = req.body

    // again conditionss
    if (!commentId || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID and vote value are required'
      })
    }

    if (value !== 1 && value !== -1) {
      return res.status(400).json({
        success: false,
        message: 'Vote value must be 1 (upvote) or -1 (downvote)'
      })
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    // get values
    const commentIdNum = parseInt(commentId)
    const numericValue = Number(value)

    const comment = await db.select().from(comments).where(
      eq(comments.id, commentIdNum)
    ).limit(1)

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      })
    }


    // find existing vote
    const existingVote = await db.select().from(votes).where(
      and(
        eq(votes.userId, req.userId),
        eq(votes.commentId, commentIdNum)
      )
    ).limit(1)

    if (existingVote.length > 0) {
      await db.update(votes).set({
        value: numericValue
      }).where(eq(votes.id, existingVote[0].id))
    } else {
      await db.insert(votes).values({
        userId: req.userId,
        commentId: commentIdNum,
        value: numericValue
      })
    }

    // recalcuate
    await recalculateCommentVotes(commentIdNum)

    // send success message
    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully'
    })

  } catch (error) {
    // send error message
    console.error('Vote comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}


// --- removeVote ---
export const removeVotePost = async (req: Request, res: Response) => {
  try {
   
    const { postId } = req.params

    // check for useriddd ( cuz u can bypass middleware)
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }


     // get values
    const vote = await db.select().from(votes).where(
      and(
        eq(votes.userId, req.userId),
        eq(votes.postId, parseInt(postId))
      )
    ).limit(1)

    if (vote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      })
    }
    
    // quering db to delete votes
    await db.delete(votes).where(eq(votes.id, vote[0].id))
    await recalculatePostVotes(parseInt(postId))


    // send status
    res.status(200).json({
      success: true,
      message: 'Vote removed successfully'
    })
  } catch (error) {

    // send error and log it in
    console.error('Remove post vote error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}


// --- removeVoteComment ---
export const removeVoteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const vote = await db.select().from(votes).where(
      and(
        eq(votes.userId, req.userId),
        eq(votes.commentId, parseInt(commentId))
      )
    ).limit(1)

    if (vote.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vote not found'
      })
    }

    await db.delete(votes).where(eq(votes.id, vote[0].id))
    await recalculateCommentVotes(parseInt(commentId))

    res.status(200).json({
      success: true,
      message: 'Vote removed successfully'
    })
  } catch (error) {
    console.error('Remove comment vote error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// --- recalculate post votees ---
const recalculatePostVotes = async (postId: number) => {
  const upvotes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(votes).where(
    and(
      eq(votes.postId, postId),
      eq(votes.value, 1)
    )
  )

  const downvotes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(votes).where(
    and(
      eq(votes.postId, postId),
      eq(votes.value, -1)
    )
  )

  await db.update(posts).set({
    upvotes: Number(upvotes[0]?.count ?? 0),
    downvotes: Number(downvotes[0]?.count ?? 0)
  }).where(eq(posts.id, postId))
}

// -- recalculate comment vote --- 
const recalculateCommentVotes = async (commentId: number) => {
  const upvotes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(votes).where(
    and(
      eq(votes.commentId, commentId),
      eq(votes.value, 1)
    )
  )

  const downvotes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(votes).where(
    and(
      eq(votes.commentId, commentId),
      eq(votes.value, -1)
    )
  )

  await db.update(comments).set({
    upvotes: Number(upvotes[0]?.count ?? 0),
    downvotes: Number(downvotes[0]?.count ?? 0)
  }).where(eq(comments.id, commentId))
}