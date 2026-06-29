'use client'


import { useState, useEffect } from 'react'
import { voteAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'

// prop of comment
interface CommentVoteProps {
  commentId: number
  upvotes: number
  downvotes: number
  userVote?: 1 | -1 | 0
}


// comment 
export default function CommentVote({ commentId, upvotes, downvotes, userVote= 0 }: CommentVoteProps) {
  const {user} = useAuth()
  const router = useRouter()
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes)
  const [loading, setLoading] = useState(false)
  const [voteState, setVoteState] = useState<1 | -1 | 0>(userVote)

  useEffect(()=> { setCurrentUpvotes(upvotes)}, [upvotes])
  useEffect(()=> { setCurrentDownvotes(downvotes)}, [downvotes])
  useEffect(()=> { setVoteState(userVote)}, [userVote])


  const handleVote = async (value: number) => {
    if (!user) 
    {
      toast.error('Please login')
      return
    }
    if (loading) return

    const prev = voteState
    const next = prev === value ? 0 : value

    let upDelta = 0
    let downDelta = prev === value ? 0: value

    if( prev === 1) upDelta -= 1
    if( prev === -1) downDelta -= 1
    if (next === 1) upDelta += 1
    if (next === -1) downDelta += 1

    setVoteState(next)
    setCurrentUpvotes(u => u+ upDelta)
    setCurrentDownvotes(d => d+ downDelta)
    setLoading(true)

    try {
      if (next === 0) 
      {
        await voteAPI.removeCommentVote(commentId)
      }
      else {
        await voteAPI.voteComment(commentId, next)
      }
    } catch (error) {
      setVoteState(prev)
      setCurrentUpvotes(u => u - upDelta)
      setCurrentDownvotes(d => d - downDelta)
      toast.error(error?.response?.data?.message || 'Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  const score = currentUpvotes - currentDownvotes

  return (
    <div className='flex flex-col items-center gap-1 pr-2'>
      <button 
        onClick={() => handleVote(1)}
        disabled={loading}
        aria-label='Upvote'
        className={`p-1 rounded transition-colors disabled:opacity-50 ${
            voteState === 1 ? 'text-orange-500': 'text-muted-foreground hover:text-orange-500 hover:bg-accent'
          }`}
      >
        <ArrowBigUp className={`w-4 h-4 ${voteState === 1 ? 'fill-orange-500': ''}`}/>
      </button>
      <span className='text-xs font-bold'>{score}</span>
      <button
        onClick={()=> handleVote(-1)}
        disabled={loading}
        className={`p-1 rounded transition-colors disabled:opacity-50 ${
            voteState === -1 ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500 hover:bg-accent'
          }`}
      >
        <ArrowBigDown className={`w-4 h-4 ${voteState === -1 ? 'fill-blue-500': ''}`}/>
      </button>
    </div>
  )
}
