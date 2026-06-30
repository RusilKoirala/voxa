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

// --- Routes :D ---- //

// create comment (nice one pls)
router.post('/', authenticateToken, createComment)
// update comment
router.put('/:id', authenticateToken, updateComment)
// delete comment
router.delete('/:id', authenticateToken, deleteComment)


// get  post by id
router.get('/post/:postId', getCommentsByPost)

// get comment by id
router.get('/:id', getCommentById)


export default router