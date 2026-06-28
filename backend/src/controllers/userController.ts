import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { users, posts, comments } from '../db/schema.js'
import { eq, sql, desc, avg } from 'drizzle-orm'


export const getUserByUsername = async( req: Request, res: Response) => {
    try {
        const { username } = req.params

        const user = await db.select({
            id: users.id,
            username: users.username,
            avatar: users.avatar,
            bio: users.bio,
            createdAt : users.createdAt,
        }).from(users).where(
            eq(users.username, username)
        ).limit(1)

        if (user.length === 0){
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const userId = user[0].id
        
        const [postCountRes, commentCountRes, postKarmaRes, commentKarmaRes] = await Promise.all([
                db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.authorId, userId)),
                db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.authorId, userId)),
                db.select({ total: sql<number>`COALESCE(SUM(${posts.upvotes} - ${posts.downvotes}), 0)` }).from(posts).where(eq(posts.authorId, userId)),
                db.select({ total: sql<number>`COALESCE(SUM(${comments.upvotes} - ${comments.downvotes}), 0)` }).from(comments).where(eq(comments.authorId, userId)),

                // yes this query is ai made (I asked to solve HOW TO DO )
        ])
        const karma = Number(postKarmaRes[0].total) + Number(commentKarmaRes[0].total)
        
        const userPosts = await db.query.posts.findMany({
            where: eq(posts.authorId, userId),
            with: { community: true },
            orderBy: [desc(posts.createdAt)],
            limit: 25,
        })

        const userComments = await db.query.comments.findMany({
            where: eq(comments.authorId,
                userId,
            ), with : {
                post: { with: {
                    community: true,
                }}
            },
            orderBy: [desc(comments.createdAt)],
            limit: 25,
        })

        res.status(200).json({
            success: true, 
            data: {
                user: user[0],
                karma,
                postCount: Number(postCountRes[0].count),
                commentCountRes: Number(commentCountRes[0].count),
                posts: userPosts,
                comments: userComments
            }
        })
    } catch (error) {
        console.error('Get user by username error:', error)
    }
}