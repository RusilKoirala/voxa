import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { authenticateToken } from '../middleware/auth.js'
import { generateToken } from '../utils/jwt.js'

export const register = async (req:Request, res:Response) => 
{
    try
    {
        const {username, email, password} = req.body

        if (!username || !email || !password) 
        {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password required'
            })
        }

        const existingUser = await db.select().from(users).where(
            eq(users.email,email)
        ).limit(1)

        if (existingUser.length > 0) 
        {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            })
        }

        const existingUsername = await db.select().from(users).where(
            eq(users.username, username)
        ).limit(1)

        if (existingUsername.length > 0) 
        {
            return res.status(409).json({
                success: false,
                message: 'Username already taken',
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newUser = await db.insert(users).values({
            username,
            email,
            passwordHash
        }).returning({
            id: users.id,
            username: users.username,
            email: users.email,
            createdAt: users.createdAt,
        })

        const token = generateToken(newUser[0].id)

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: newUser[0]
            }
        })
        
    } catch (error) 
    {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const login = async (req:Request, res:Response) => 
{
    try {
        const { email, password } = req.body;

        if (!email || !password) 
        {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
        }

        const user = await db.select().from(users).where(
            eq(users.email, email)
        ).limit(1)

        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].passwordHash)

        if(!isPasswordValid) 
        {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const token = generateToken(user[0].id)

        const { passwordHash , ...userWithoutPassword} = user[0]

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword
            }
        })
    } catch (error) 
    {
        console.error('Login error:', error)
        
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    })

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
}

export const getProfile = async (req: Request, res: Response) => { 
    try { 
        
        if (!req.userId) 
        { 
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized" 
            }) 
        } 

        const user = await db.select({ 
            id: users.id, 
            username: users.username, 
            email: users.email, 
            avatar: users.avatar, 
            bio: users.bio, 
            createdAt: users.createdAt, 
            updatedAt: users.updatedAt, 
        }).from(users).where(eq(users.id, req.userId)).limit(1) 

        if (user.length === 0) 
        { 
            return res.status(404).json({ 
                success: false, 
                message: 'User not found', 
            }) 
        } 

        res.status(200).json({ 
            success: true, 
            data: user[0], 
        }) 

    } catch (error) 
    { 
        console.error('Get profile error:', error) 
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        }) 
    } 
}