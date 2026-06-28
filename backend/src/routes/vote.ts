import express from "express"
import {
  votePost,
  voteComment,
  removeVotePost,
  removeVoteComment
} from "../controllers/voteController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()



router.post('/post', authenticateToken, votePost)
router.post('/comment', authenticateToken, voteComment)
router.delete('/post/:postId', authenticateToken,removeVotePost)
router.delete('/comment/:commentId', authenticateToken, removeVoteComment)

export default router