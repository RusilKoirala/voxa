import express from 'express'
import { getUserByUsername } from '../controllers/userController'
import { updateUserProfile } from '../controllers/userController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// get User by username
router.get('/:username', getUserByUsername)


// get user profile
router.put('/profile', authenticateToken, updateUserProfile)


export default router