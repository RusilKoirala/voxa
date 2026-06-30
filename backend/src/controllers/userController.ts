import { Request, Response } from 'express'
import { db } from '../db/index.js'
import { users, posts, comments , votes} from '../db/schema.js'
import { eq, sql, desc, avg } from 'drizzle-orm'
import { date } from 'drizzle-orm/mysql-core'


// get user by username (ex: bob404)
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

// update user profile (CHANGE NAME, etc)
export const updateUserProfile = async (req:Request, res: Response) => {
    try {
        const { bio , avatar} = req.body
        const userId = req.userId

        if (!userId) 
        {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const updatedUser = await db.update(users).set({
            bio: bio || undefined,
            avatar: avatar || undefined,
            updatedAt: new Date()
        }).where(eq(users.id, userId)).returning({
            id: users.id,
            username: users.username,
            avatar: users.avatar,
            bio: users.bio,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        })
    } catch (error) {
        console.error('Update profile error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// user activity sender
export const getUserActivity = async (req: Request, res: Response) => {
    try {
        const { username} = req.params
        const { page = 1, limit = 20} =req.query
        const offset = (Number(page)- 1) * Number(limit)
        const user = await db.select({id: users.id})
            .from(users)
            .where(eq((users.username, username)))
            .limit(1)

        if (user.length === 0 ) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const userId = user[0].id

        const userPosts = await db.select().from(posts)
            .where(eq(posts.authorId, userId))
            .limit(Number(limit))
            .offset(offset)
            .orderBy(desc(posts.createdAt))

        const userComments = await db.select().from(comments).where(eq(
            comments.authorId, userId
        ))
        .limit(Number(limit))
        .offset(offset)
        .orderBy(desc(comments.createdAt))


        const userVotes = await db.select().from(votes).where(
            eq(votes.userId, userId)
        )
        .limit(Number(limit))
        .offset(offset)
        .orderBy(desc(votes.createdAt))

        const activites = [
            ...userPosts.map(p => ({
                type: 'post',
                data: p,
                date: p.createdAt,
            })),
            ...userComments.map(c=> ({
                type: 'comment',
                data: c,
                date: c.createdAt,
            })),
            ...userVotes.map(v=> ({
                type: 'vote',
                data: v,
                date: v.createdAt
            }))
        ].sort((a,b)=> new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, Number(limit))

        res.status(200).json({
            success: true,
            data: activites
        })
    } catch (error) {
        console.log('User activity error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
