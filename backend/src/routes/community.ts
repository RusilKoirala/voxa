import express from "express"

import {createCommunity, getAllCommunities, getCommunityById, joinCommunity, leaveCommunity, getCommunityMembers, checkCommunityMembership} from '../controllers/communityController'

import { authenticateToken } from "../middleware/auth"

const router = express.Router()

router.post('/', authenticateToken, createCommunity)
router.get('/', getAllCommunities)
router.get('/:id',getCommunityById)
router.get('/:id/membership', authenticateToken, checkCommunityMembership)
router.post('/:id/join', authenticateToken, joinCommunity)
router.post('/:id/leave', authenticateToken, leaveCommunity)
router.get('/:id/members', getCommunityMembers)

export default router