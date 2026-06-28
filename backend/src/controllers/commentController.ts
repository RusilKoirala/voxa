import { Request, Response } from "express";
import { db } from "../db";
import { comments, posts } from "../db/schema";

import {eq, and} from 'drizzle-orm'


export const createComment = async (req: Request, res:Response) => {
    try {
        const {content, postId, parentId} = req.body
        
        if (!content || !postId) {
            return res.status(400).json({
                success: false,
                message: 'Content and post ID are required'
            })
        }

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            })
        }

        const post = await db.select().from(posts).where(
            eq(posts.id, parseInt(postId)) 
        ).limit(1)

        if (post.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            })
        }

        if (parentId) {
            const parentComment = await db.select().from(comments).where(
                eq(comments.id, parseInt(parentId))
            ).limit(1)

            if (parentComment.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent comment not found'
                })
            }
        }

        const newComment = await db.insert(comments).values({
            content,
            authorId: req.userId,
            postId: parseInt(postId),
            parentId: parentId ? parseInt(parentId) : null
        }).returning()

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: newComment[0],
        })

    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const getCommentsByPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params

        const postComments = await db.select().from(comments).where(
            eq(comments.postId, parseInt(postId))
        )
        res.status(200).json({
            success: true,
            message: 'Comments fetched successfuly',
            data: postComments
        })
    
    } catch (error) {
        console.error('Get comments by post error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }

}

export const getCommentById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params

        const comment = await db.select().from(comments).where(
            eq(comments.id, parseInt(id))
        )

        if(comment.length === 0) {
            return res.status(404).json({
                succes: false,
                message: 'Comment not found'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Comments fetched successfully',
            data: comment[0]
        })
    } catch (error) {
        console.error('Get comment by id error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const updateComment = async (req:Request, res: Response) => {
    try {
        const {id} = req.params
        const {content} = req.body

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            })
        }

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const comment = await db.select().from(comments).where(
            eq(comments.id, parseInt(id))
        ).limit(1)

        if (comment.length === 0)
        {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            })
        }

        if (comment[0].authorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own comments'
            })
        }

        const updatedComment = await db.update(comments).set({
            content,
            updatedAt : new Date()
        }).where(eq(comments.id, parseInt(id))).returning()

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully',
            data: updateComment[0]
        })
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}


export const deleteComment = async (req:Request, res:Response) => {
    try {
        const {id } = req.params

        if (!req.userId) 
        {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const comment = await db.select().from(comments).where(
            eq(comments.id,parseInt(id))
        ).limit(1)

        if (comment.length === 0) {
            return res.status(404).json({
                success: false, 
                message: 'Comment not found',
            })
        }

        if (comment[0].authorId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your comments'
            })
        }

        await db.delete(comments).where(eq(comments.id, parseInt(id)))

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        })
    } catch (error) {
        console.error('Delete comment error:', error)
        res.status(500).json({
            success: false,
            message : 'Internal server error'
        })
    }
}