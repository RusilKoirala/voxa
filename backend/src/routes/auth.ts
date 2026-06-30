import express from "express"
import { register, login, getProfile, logout } from "../controllers/authController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// --- USER AUTHH --- //

// register (GIVE ME YOUR DETAILS)
router.post('/register', register);

// login (TAKE JWT TOKEN)
router.post('/login', login)

// logout (REMOVE JWT TOKEN)
router.post('/logout', logout)

// give me your detaill
router.get('/me', authenticateToken,getProfile)

export default router