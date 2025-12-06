'use client'

import { useState } from 'react'
import VerticalFeed from '@/components/VerticalFeed'
import NavMenu from '@/components/NavMenu'
import Link from 'next/link'
import { Outfit } from '@/types'

interface FeedPageClientProps {
  followingOutfits: Outfit[]
  allOutfits: Outfit[]
  currentUserId: string
}

export default function FeedPageClient({ followingOutfits, allOutfits, currentUserId }: FeedPageClientProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'for-you'>('for-you')

  const outfitsToShow = activeTab === 'following' ? followingOutfits : allOutfits

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm p-4 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">InFit</h1>
          <NavMenu />
        </div>
      </nav>

      {/* Fixed Tabs */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <div className="flex gap-6 py-3 justify-center">
          <button
            onClick={() => setActiveTab('following')}
            className={`pb-2 px-4 ${
              activeTab === 'following'
                ? 'border-b-2 border-white font-semibold text-white drop-shadow-lg'
                : 'text-white/70 hover:text-white drop-shadow-lg'
            }`}
          >
            Abonnements
          </button>
          <button
            onClick={() => setActiveTab('for-you')}
            className={`pb-2 px-4 ${
              activeTab === 'for-you'
                ? 'border-b-2 border-white font-semibold text-white drop-shadow-lg'
                : 'text-white/70 hover:text-white drop-shadow-lg'
            }`}
          >
            Pour Toi
          </button>
        </div>
      </div>

      {/* Fixed Add Button */}
      <Link href="/create">
        <button className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </Link>

      {/* Vertical Feed */}
      <div className="pt-28">
        <VerticalFeed outfits={outfitsToShow} currentUserId={currentUserId} />
      </div>
    </main>
  )
}
