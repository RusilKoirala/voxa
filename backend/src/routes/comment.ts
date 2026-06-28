import express from "express"
import {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment
} from "../controllers/commentController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post('/', authenticateToken, createComment)

router.get('/post/:postId', getCommentsByPost)
router.get('/:id', getCommentById)

router.put('/:id', authenticateToken, updateComment)
router.delete('/:id', authenticateToken, deleteComment)


export default router