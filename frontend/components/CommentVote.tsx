'use client'

import { useState } from 'react'
import { voteAPI } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'

interface CommentVoteProps {
  commentId: number
  upvotes: number
  downvotes: number
}

export default function CommentVote({ commentId, upvotes, downvotes }: CommentVoteProps) {
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes)
  const [loading, setLoading] = useState(false)
  const [voteState, setVoteState] = useState<1 | -1 | 0>(0)

  const handleVote = async (value: number) => {
    setLoading(true)
    try {
      await voteAPI.voteComment(commentId, value)
      if (value === 1) {
        setCurrentUpvotes(prev => prev + (voteState === 1 ? 0 : (voteState === -1 ? 1 : 1)))
        if (voteState === -1) setCurrentDownvotes(prev => prev - 1)
        setVoteState(1)
      } else {
        setCurrentDownvotes(prev => prev + (voteState === -1 ? 0 : (voteState === 1 ? 1 : 1)))
        if (voteState === 1) setCurrentUpvotes(prev => prev - 1)
        setVoteState(-1)
      }
      toast.success('Vote recorded!')
    } catch (error) {
      toast.error('Failed to vote')
    } finally {
      setLoading(false)
    }
  }

  const score = currentUpvotes - currentDownvotes

  return (
    <div className="flex flex-col items-center gap-1 pr-2">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`p-1 rounded transition-colors disabled:opacity-50 ${voteState === 1 ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500 hover:bg-accent'}`}
      >
        <ArrowBigUp className="w-4 h-4" />
      </button>
      <span className="text-xs font-bold">{score}</span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`p-1 rounded transition-colors disabled:opacity-50 ${voteState === -1 ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500 hover:bg-accent'}`}
      >
        <ArrowBigDown className="w-4 h-4" />
      </button>
    </div>
  )
}
