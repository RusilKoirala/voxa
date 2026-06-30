import { Request, Response } from "express";
import { db } from "../db/index.js";
import { communities, communityMembers } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

// create community
export const createCommunity = async (req: Request, res: Response) => 
{
    try{
        const { name, description , icon , banner} = req.body
    
        if(!name) 
        {
            return res.status(400).json({
                success: false,
                message: 'Community name is required'
            })
        }
    
        if (!req.userId) 
        {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }

        const existingCommunity = await db.select().from(communities).where(
            eq(communities.name,name)
        ).limit(1)

        if (existingCommunity.length > 0) 
        {
            return res.status(409).json({
                success: false,
                message: "Community with this name already exists"
            })
        }

        const newCommunity = await db.insert(communities).values({
            name,
            description,
            icon,
            banner,
            creatorId: req.userId
        }).returning()

        await db.insert(communityMembers).values({
            userId: req.userId,
            communityId: newCommunity[0].id,
            isModerator: true,
        })

        res.status(201).json({
            success: true,
            message: "Community created successfully",
            data: newCommunity[0],
        })
    } 
    catch (error) 
    {
        console.error("Create community error:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
} 

// get all communites
export const getAllCommunities = async (req:Request, res:Response) => {
    try {
        const allCommunites = await db.select().from(communities)

        res.status(200).json({
            success: true,
            data: allCommunites
        })
    } catch (error) {
        console.error('Get all communities error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// get community by id
export const getCommunityById = async (req:Request, res:Response) => {
    try {
        const {id} = req.params

        const community = await db.select().from(communities).where(
            eq(communities.id, parseInt(id))
        ).limit(1)

        if (community.length === 0) 
        {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            })
        }

        res.status(200).json({
            success:true,
            message: 'Community fetched successfully',
            data: community[0]
        })
    } catch (error) {
        console.error('Get community by id error', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

// join community
export const joinCommunity = async (req: Request, res: Response) => {
    try {
        const {id} = req.params

        if (!req.userId) 
        {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const community = await db.select().from(communities).where(
            eq(communities.id, parseInt(id))
        ).limit(1)

        if(community.length === 0) 
        {
            return res.status(404).json({
                success: false,
                message: 'Community not found'
            })
        }
        const existingMember = await db.select().from(communityMembers).where(
            and(
                eq(communityMembers.userId, req.userId),
                eq(communityMembers.communityId, parseInt(id))
            )
        )

        if (existingMember.length > 0) 
        {
            return res.status(409).json({
                success: false, 
                message: 'Already a member of this community'
            })
        }

        await db.insert(communityMembers).values({
            userId: req.userId,
            communityId: parseInt(id)
        })

        res.status(200).json({
            success: true,
            message: "Joined community successfully"
        })
    } catch (error) 
    {
        console.error('Join community error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        }) 
    }
}

// leave community
export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const community = await db.select().from(communities).where(
      eq(communities.id, parseInt(id))
    ).limit(1)

    if (community.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      })
    }

    const membership = await db.select().from(communityMembers).where(
      and(
        eq(communityMembers.userId, req.userId),
        eq(communityMembers.communityId, parseInt(id))
      )
    ).limit(1)

    if (membership.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Not a member of this community'
      })
    }

    if (membership[0].isModerator && community[0].creatorId === req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Creator cannot leave the community'
      })
    }

    await db.delete(communityMembers).where(
      and(
        eq(communityMembers.userId, req.userId),
        eq(communityMembers.communityId, parseInt(id))
      )
    )

    res.status(200).json({
      success: true,
      message: 'Left community successfully'
    })
  } catch (error) {
    console.error('Leave community error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// get community members
export const getCommunityMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const members = await db.select().from(communityMembers).where(
      eq(communityMembers.communityId, parseInt(id))
    )

    res.status(200).json({
      success: true,
      message: 'Community members fetched successfully',
      data: members
    })
  } catch (error) {
    console.error('Get community members error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// check community membership plss
export const checkCommunityMembership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return res.status(200).json({
        success: true,
        data: false,
      });
    }

    const membership = await db.select().from(communityMembers).where(
      and(
        eq(communityMembers.userId, req.userId),
        eq(communityMembers.communityId, parseInt(id))
      )
    ).limit(1);

    res.status(200).json({
      success: true,
      data: membership.length > 0,
    });
  } catch (error) {
    console.error('Check community membership error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}