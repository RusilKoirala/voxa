import express from 'express'
import { getUserByUsername } from '../controllers/userController'
import { updateUserProfile } from '../controllers/userController'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

router.get('/:username', getUserByUsername)
router.put('/profile', authenticateToken, updateUserProfile)

export default router