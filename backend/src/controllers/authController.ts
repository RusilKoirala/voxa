import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { generateToken } from '../utils/jwt.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'
import crypto from 'crypto'

// register user (NOW the controller in my head by writing it alot)
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
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const newUser = await db.insert(users).values({
            username,
            email,
            passwordHash,
            verificationToken,
            verificationTokenExpires
        }).returning({
            id: users.id,
            username: users.username,
            email: users.email,
            createdAt: users.createdAt,
        })

        // send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        await sendVerificationEmail(email, verificationUrl)

        const token = generateToken(newUser[0].id)

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })

        res.status(201).json({
            success: true,
            message: "User registered successfully! Check your email for verification.",
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

// login user (EZ )
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

        // check if email is verified
        if (!user[0].isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first',
                needsVerification: true
            })
        }

        const token = generateToken(user[0].id)

        const { passwordHash , ...userWithoutPassword} = user[0]

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
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

// verify email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            })
        }

        const user = await db.select().from(users).where(
            eq(users.verificationToken, token as string)
        ).limit(1)

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            })
        }

        // check if token expired
        if (user[0].verificationTokenExpires && new Date() > user[0].verificationTokenExpires) {
            return res.status(400).json({
                success: false,
                message: 'Verification token expired'
            })
        }

        // update user
        await db.update(users).set({
            isVerified: true,
            verificationToken: null,
            verificationTokenExpires: null
        }).where(eq(users.id, user[0].id))

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!'
        })

    } catch (error) {
        console.error('Verify email error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// resend verification email
export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }

        const user = await db.select().from(users).where(
            eq(users.email, email)
        ).limit(1)

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        if (user[0].isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            })
        }

        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await db.update(users).set({
            verificationToken,
            verificationTokenExpires
        }).where(eq(users.id, user[0].id))

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        await sendVerificationEmail(email, verificationUrl)

        res.status(200).json({
            success: true,
            message: 'Verification email resent!'
        })

    } catch (error) {
        console.error('Resend verification email error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// logout user (REMOVE HIMM)
export const logout = async (req: Request, res: Response) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/'
    })

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    })
}

// getProfile 
export const getProfile = async (req: Request, res: Response) => { 
    try { 
        // we DONT BELIEVE in middleware
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
            isVerified: users.isVerified,
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




// send password reset email
export const sendPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body 

        if (!email ) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }

        const user = await db.select().from(users).where(
            eq(users.email, email)
        ).limit(1)

        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const ressetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // about 1 hour

        await db.update(users).set({
            resetPasswordToken: ressetToken,
            resetPasswordTokenExpires: resetTokenExpires
        }).where(eq(users.id, user[0].id))

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${ressetToken}`
        await sendPasswordResetEmail(email, resetUrl)

        res.status(200).json({
            success: true,
            message: 'Password reset email sent!'
        })


    } catch (error) {
        console.error('Send password reset email error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// reset password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required'
            })

        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            })   
        }

        const user = await db.select().from(users).where(
            eq(users.resetPasswordToken, token)
        ).limit(1)

        if (user.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            })
        }

        if (user[0].resetPasswordTokenExpires && new Date() > user[0].resetPasswordTokenExpires) {
            return res.status(400).json({
                success: false,
                message: 'Reset token expired'
            })
        }

        const passwordHash = await bcrypt.hash(newPassword, 10)

        await db.update(users).set({
            passwordHash,
            resetPasswordToken: null,
            resetPasswordTokenExpires: null
        }).where(eq(users.id, user[0].id))

        res.status(200).json({

            success: true,
            message: 'Password reset successfully!'
        })
    
    } catch (error) {
        console.error('Reset password error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
