import express from "express"

import {createCommunity, getAllCommunities, getCommunityById, joinCommunity, leaveCommunity, getCommunityMembers} from '../controllers/communityController'

import { authenticateToken } from "../middleware/auth"

const router = express.Router()

router.post('/', authenticateToken, createCommunity)
router.get('/', getAllCommunities)
router.get('/:id',getCommunityById)
router.post('/:id/join', authenticateToken, joinCommunity)
router.post('/:id/leave',leaveCommunity)
router.get('/:id/members', getCommunityMembers)

export default router