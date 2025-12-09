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

      {/* Fixed Tabs - Taille fixe, fond transparent */}
      <div 
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{ 
          top: 'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))'
        }}
      >
        <div className="flex gap-6 justify-center py-3 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('following')
            }}
            className={`px-4 text-base pb-2 transition-all duration-200 ${
              activeTab === 'following'
                ? 'border-b-2 border-white font-semibold text-white'
                : 'text-white/70 hover:text-white'
            }`}
            style={{
              textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.8)'
            }}
          >
            Abonnements
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('for-you')
            }}
            className={`px-4 text-base pb-2 transition-all duration-200 ${
              activeTab === 'for-you'
                ? 'border-b-2 border-white font-semibold text-white'
                : 'text-white/70 hover:text-white'
            }`}
            style={{
              textShadow: '0 0 8px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.8)'
            }}
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
      <VerticalFeed outfits={outfitsToShow} currentUserId={currentUserId} />
    </main>
  )
}
