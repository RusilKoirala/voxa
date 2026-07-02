import express from "express"
import {
  createPost,
  getPostsByCommunity,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts,
  getTrendingPosts,
  searchPosts,
  getImageUploadSignature,
  uploadImage
} from "../controllers/postController.js"
import { authenticateToken } from "../middleware/auth.js"
import { getUserActivity } from "../controllers/userController.js"

const router = express.Router()

// get image upload signature
router.get('/upload-signature', authenticateToken, getImageUploadSignature)

// upload image
router.post('/upload-image', authenticateToken, uploadImage)

// create post 
router.post('/', authenticateToken, createPost)

// get all post to the user
router.get('/', getAllPosts)

// get community by id (I LOVE COMMUNITES)
router.get('/community/:communityId', getPostsByCommunity)

// send trending post
router.get('/trending', getTrendingPosts)

// search the postt
router.get('/search', searchPosts)

// get users activityy
router.get('/:username/activity', getUserActivity)

// post by id
router.get('/:id',  getPostById)

// update the post
router.put('/:id', authenticateToken, updatePost)

// delete the post
router.delete('/:id', authenticateToken, deletePost)

export default router