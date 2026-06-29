import { db } from '../db/index.js'
import { votes } from '../db/schema.js'
import { and, eq, inArray } from 'drizzle-orm'

/**
 * Attach the current user's vote value to a single post.
 * Returns the post with a `userVote` field (1, -1, or 0 if not voted / unauthenticated).
 */
export const attachUserVoteToPost = async <T extends { id: number }>(
  post: T,
  userId: number | undefined
): Promise<T & { userVote: 1 | -1 | 0 }> => {
  if (!userId) {
    return { ...post, userVote: 0 }
  }

  const existing = await db
    .select({ value: votes.value })
    .from(votes)
    .where(and(eq(votes.postId, post.id), eq(votes.userId, userId)))
    .limit(1)

  return { ...post, userVote: (existing[0]?.value as 1 | -1 | 0) ?? 0 }
}

/**
 * Batch version: attaches `userVote` to each post in a single query.
 * Avoids the N+1 problem when listing many posts.
 */
export const attachUserVoteToPosts = async <T extends { id: number }>(
  postList: T[],
  userId: number | undefined
): Promise<Array<T & { userVote: 1 | -1 | 0 }>> => {
  if (postList.length === 0) return []

  if (!userId) {
    return postList.map((p) => ({ ...p, userVote: 0 }))
  }

  const ids = postList.map((p) => p.id)
  const userVotes = await db
    .select({ postId: votes.postId, value: votes.value })
    .from(votes)
    .where(and(eq(votes.userId, userId), inArray(votes.postId, ids)))

  const voteMap = new Map<number, 1 | -1>()
  for (const v of userVotes) {
    if (v.postId !== null) voteMap.set(v.postId, v.value as 1 | -1)
  }

  return postList.map((p) => ({
    ...p,
    userVote: voteMap.get(p.id) ?? 0,
  }))
}

/**
 * Attach the current user's vote to a single comment.
 */
export const attachUserVoteToComment = async <T extends { id: number }>(
  comment: T,
  userId: number | undefined
): Promise<T & { userVote: 1 | -1 | 0 }> => {
  if (!userId) {
    return { ...comment, userVote: 0 }
  }

  const existing = await db
    .select({ value: votes.value })
    .from(votes)
    .where(and(eq(votes.commentId, comment.id), eq(votes.userId, userId)))
    .limit(1)

  return { ...comment, userVote: (existing[0]?.value as 1 | -1 | 0) ?? 0 }
}

/**
 * Batch version: attaches `userVote` to each comment in a single query.
 */
export const attachUserVoteToComments = async <T extends { id: number }>(
  commentList: T[],
  userId: number | undefined
): Promise<Array<T & { userVote: 1 | -1 | 0 }>> => {
  if (commentList.length === 0) return []

  if (!userId) {
    return commentList.map((c) => ({ ...c, userVote: 0 }))
  }

  const ids = commentList.map((c) => c.id)
  const userVotes = await db
    .select({ commentId: votes.commentId, value: votes.value })
    .from(votes)
    .where(and(eq(votes.userId, userId), inArray(votes.commentId, ids)))

  const voteMap = new Map<number, 1 | -1>()
  for (const v of userVotes) {
    if (v.commentId !== null) voteMap.set(v.commentId, v.value as 1 | -1)
  }

  return commentList.map((c) => ({
    ...c,
    userVote: voteMap.get(c.id) ?? 0,
  }))
}
