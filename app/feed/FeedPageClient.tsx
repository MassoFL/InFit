'use client'

import { useState, useEffect } from 'react'
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
  const [isNavExpanded, setIsNavExpanded] = useState(false)

  const outfitsToShow = activeTab === 'following' ? followingOutfits : allOutfits
  
  // Toggle la navigation
  const toggleNav = () => {
    setIsNavExpanded(!isNavExpanded)
  }
  
  // Détecter le scroll pour réduire la nav
  useEffect(() => {
    const handleScroll = () => {
      if (isNavExpanded) {
        setIsNavExpanded(false)
      }
    }
    
    window.addEventListener('wheel', handleScroll)
    window.addEventListener('touchmove', handleScroll)
    
    return () => {
      window.removeEventListener('wheel', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
    }
  }, [isNavExpanded])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Fixed Navigation - Petite par défaut, s'agrandit au clic */}
      <nav 
        onClick={toggleNav}
        className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 transition-all duration-300 cursor-pointer ${
          isNavExpanded ? 'py-4' : 'py-1'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className={`font-bold text-black transition-all duration-300 ${
            isNavExpanded ? 'text-2xl' : 'text-sm'
          }`}>
            InFit
          </h1>
          <div className={`transition-all duration-300 ${
            isNavExpanded ? 'scale-100' : 'scale-75'
          }`}>
            <NavMenu />
          </div>
        </div>
      </nav>

      {/* Fixed Tabs - S'agrandit aussi au clic */}
      <div 
        onClick={toggleNav}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 cursor-pointer ${
          isNavExpanded ? 'top-16' : 'top-8'
        }`}
      >
        <div className={`flex gap-6 justify-center transition-all duration-300 ${
          isNavExpanded ? 'py-3' : 'py-1'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('following')
            }}
            className={`px-4 transition-all duration-300 ${
              isNavExpanded ? 'text-base pb-2' : 'text-xs pb-1'
            } ${
              activeTab === 'following'
                ? 'border-b-2 border-white font-semibold text-white drop-shadow-lg'
                : 'text-white/70 hover:text-white drop-shadow-lg'
            }`}
          >
            Abonnements
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('for-you')
            }}
            className={`px-4 transition-all duration-300 ${
              isNavExpanded ? 'text-base pb-2' : 'text-xs pb-1'
            } ${
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
      <div className={`transition-all duration-300 ${
        isNavExpanded ? 'pt-28' : 'pt-16'
      }`}>
        <VerticalFeed outfits={outfitsToShow} currentUserId={currentUserId} />
      </div>
    </main>
  )
}
