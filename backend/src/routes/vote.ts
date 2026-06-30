import express from "express"
import {
  votePost,
  voteComment,
  removeVotePost,
  removeVoteComment
} from "../controllers/voteController.js"
import { authenticateToken } from "../middleware/auth.js"

// router
const router = express.Router()


// routes

// vote post (GIVE THE VOTE TO MEE)
router.post('/post', authenticateToken, votePost)

// post the commenttt
router.post('/comment', authenticateToken, voteComment)

// remove vote postt
router.delete('/post/:postId', authenticateToken,removeVotePost)

// remove vote comment
router.delete('/comment/:commentId', authenticateToken, removeVoteComment)

export default router