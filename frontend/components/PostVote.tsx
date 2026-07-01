'use client'

import { useState, useEffect } from 'react'
import { voteAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'

interface PostVoteProps {
  postId: number
  upvotes: number
  downvotes: number
  userVote?: 1 | -1 | 0
}

export default function PostVote({ postId, upvotes, downvotes, userVote=0 }: PostVoteProps) {
  const {user} = useAuth()

  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes)
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes)
  const [voteState, setVoteState] = useState<1| -1 | 0>(userVote)
  const [loading, setLoading] = useState(false)

  useEffect(()=> {setCurrentUpvotes(upvotes)}, [upvotes])
  useEffect(()=> {setCurrentDownvotes(downvotes)}, [downvotes])
  useEffect(()=> {setVoteState(userVote)}, [userVote])

  const handleVote = async (value: 1 | -1) => {
    if (!user) {
      toast.error("please login to vote :(")
      return
    }

    if (loading) return

    // optimistic update
    const prev = voteState
    const next = prev === value ? 0 : value

    let upDelta = 0
    let downDelta = 0 

    if (prev === 1) upDelta -= 1
    if (prev === -1) downDelta -=1
    if (next === 1 ) upDelta +=1
    if (next === -1 ) downDelta += 1

    setVoteState(next)
    setCurrentUpvotes(u=> u+upDelta)
    setCurrentDownvotes(d=> d+downDelta)
    setLoading(true)

    try {
      if (next === 0) {
        await voteAPI.removePostVote(postId)
        toast.success('vote removed!')
      } else {
        await voteAPI.votePost(postId, next)
        toast.success('voted! :D')
      }
    } catch (error: any) {
      setVoteState(prev)
      setCurrentUpvotes(u => u - upDelta)
      setCurrentDownvotes(d => d - downDelta)
      toast.error(error?.response?.data?.message || 'failed to vote :(')
    } finally {
      setLoading(false)
    }
  }

  const score = currentUpvotes - currentDownvotes

  return (
    <div className='flex flex-col items-center gap-1 bg-muted/50 p-2 rounded-l-md border-r'>
      <button 
        onClick={()=> handleVote(1)}
        disabled={loading}
        aria-label='Upvote'
        className= {`p-1 rounded transition-colors disabled:opacity-50 ${
            voteState === 1 ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500 hover:bg-accent'
          }`}>
            <ArrowBigUp className={`w-6 h-6 ${voteState === 1 ? 'fill-orange-500': ''}`}/>
      </button>
      <span className='text-sm font-bold'>
        { score >= 1000 ? `${(score/1000).toFixed(1)}k` : score}
      </span>
      <button 
        onClick={()=> handleVote(-1)}
        disabled={loading}
        aria-label='Downvote'
        className={`p-1 rounded transition-colors disabled:opacity-50 ${
          voteState === -1 ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500 hover:bg-accent'
          }`}
        >
          <ArrowBigDown className={`w-6 h-6 ${voteState === -1 ? 'fill-blue-500' : ''}`}/>
        </button>
    </div>
  )
}
