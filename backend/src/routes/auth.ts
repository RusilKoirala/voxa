import express from "express"
import { register, login, getProfile, logout } from "../controllers/authController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

router.post('/register', register);
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticateToken,getProfile)

export default router