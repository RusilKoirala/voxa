import express from "express"
import {
  createPost,
  getPostsByCommunity,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts
} from "../controllers/postController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()


router.post('/', authenticateToken, createPost)
router.get('/', getAllPosts)
router.get('/community/:communityId', getPostsByCommunity)
router.get('/:id',  getPostById)
router.put('/:id', authenticateToken, updatePost)
router.delete('/:id', authenticateToken, deletePost)

export default router