'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

interface FollowButtonProps {
  userId: string
  currentUserId: string
  initialIsFollowing: boolean
}

export default function FollowButton({ userId, currentUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  const toggleFollow = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId)
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: userId })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-medium ${
        isFollowing
          ? 'bg-gray-200 text-black hover:bg-gray-300'
          : 'bg-black text-white hover:bg-gray-800'
      } disabled:opacity-50`}
    >
      {loading ? '...' : isFollowing ? 'Abonné' : 'S\'abonner'}
    </button>
  )
}
