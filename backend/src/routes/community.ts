import express from "express"

import {createCommunity, getAllCommunities, getCommunityById, joinCommunity, leaveCommunity, getCommunityMembers, checkCommunityMembership} from '../controllers/communityController'

import { authenticateToken } from "../middleware/auth"

// -- router --
const router = express.Router()


//  -- my routes for community --

// - auth req -

// create community
router.post('/', authenticateToken, createCommunity)

// check community membership by id
router.get('/:id/membership', authenticateToken, checkCommunityMembership)

// join the communityy
router.post('/:id/join', authenticateToken, joinCommunity)

// leave the community
router.post('/:id/leave', authenticateToken, leaveCommunity)


// - auth not req -

// get all communities
router.get('/', getAllCommunities)

// get community by id
router.get('/:id',getCommunityById)

// get members by id
router.get('/:id/members', getCommunityMembers)

export default router