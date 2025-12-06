'use client'

import { useState, useEffect, useRef } from 'react'
import OutfitCard from './OutfitCard'
import { Outfit } from '@/types'

interface VerticalFeedProps {
  outfits: Outfit[]
  currentUserId: string
}

export default function VerticalFeed({ outfits, currentUserId }: VerticalFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const isScrolling = useRef(false)
  const lastScrollTime = useRef(0)
  const scrollTimeoutId = useRef<NodeJS.Timeout | null>(null)
  const momentumScrolling = useRef(false)
  const lastWheelTime = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ULTRA SIMPLE - Kill all inertia completely
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const now = Date.now()
      
      // ONLY TWO CHECKS:
      // 1. Block if currently scrolling
      if (isScrolling.current) {
        return
      }
      
      // 2. AGGRESSIVE time lock - 1 second minimum between ANY scroll events
      if (now - lastScrollTime.current < 1000) {
        return
      }
      
      // Any movement triggers navigation
      if (Math.abs(e.deltaY) < 1) {
        return
      }
      
      // IMMEDIATE LOCK - no timeouts, no delays
      isScrolling.current = true
      lastScrollTime.current = now
      
      // Navigate
      if (e.deltaY > 0) {
        setCurrentIndex((prev) => Math.min(prev + 1, outfits.length - 1))
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
      }
      
      // Unlock after 1 second - HARD LOCK
      setTimeout(() => {
        isScrolling.current = false
      }, 1000)
    }

    // BULLETPROOF touch handling
    const handleTouchStart = (e: TouchEvent) => {
      if (isScrolling.current) return
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now()
      
      // Same triple protection for touch
      if (isScrolling.current || now - lastScrollTime.current < 800) {
        return
      }
      
      const touchEndY = e.changedTouches[0].clientY
      const diff = touchStartY.current - touchEndY
      
      if (Math.abs(diff) > 30) {
        // Clear any existing timeout
        if (scrollTimeoutId.current) {
          clearTimeout(scrollTimeoutId.current)
        }
        
        // LOCK EVERYTHING
        isScrolling.current = true
        lastScrollTime.current = now
        
        if (diff > 0) {
          setCurrentIndex((prev) => Math.min(prev + 1, outfits.length - 1))
        } else {
          setCurrentIndex((prev) => Math.max(prev - 1, 0))
        }
        
        // UNLOCK after animation + safety buffer
        scrollTimeoutId.current = setTimeout(() => {
          isScrolling.current = false
        }, 800)
      }
    }

    // BULLETPROOF keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now()
      
      // Same triple protection for keyboard
      if (isScrolling.current || now - lastScrollTime.current < 800) {
        return
      }
      
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        
        // Clear any existing timeout
        if (scrollTimeoutId.current) {
          clearTimeout(scrollTimeoutId.current)
        }
        
        // LOCK EVERYTHING
        isScrolling.current = true
        lastScrollTime.current = now
        
        setCurrentIndex((prev) => Math.min(prev + 1, outfits.length - 1))
        
        // UNLOCK after animation + safety buffer
        scrollTimeoutId.current = setTimeout(() => {
          isScrolling.current = false
        }, 800)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        
        // Clear any existing timeout
        if (scrollTimeoutId.current) {
          clearTimeout(scrollTimeoutId.current)
        }
        
        // LOCK EVERYTHING
        isScrolling.current = true
        lastScrollTime.current = now
        
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
        
        // UNLOCK after animation + safety buffer
        scrollTimeoutId.current = setTimeout(() => {
          isScrolling.current = false
        }, 800)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
      
      // Clean up timeout on unmount
      if (scrollTimeoutId.current) {
        clearTimeout(scrollTimeoutId.current)
      }
    }
  }, [outfits.length])

  if (outfits.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-black">Aucun outfit à afficher</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-hidden"
      style={{ 
        scrollSnapType: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'auto',
        scrollBehavior: 'auto',
        touchAction: 'none'
      }}
    >
      <div
        className="transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`,
          touchAction: 'none'
        }}
      >
        {outfits.map((outfit) => (
          <div
            key={outfit.id}
            className="h-screen w-screen"
            style={{ scrollSnapAlign: 'start' }}
          >
            <OutfitCard
              outfit={outfit}
              currentUserId={currentUserId}
              isSaved={outfit.is_saved}
              savesCount={outfit.saves_count}
              isFollowing={outfit.is_following}
            />
          </div>
        ))}
      </div>

      {/* Navigation indicators */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {outfits.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-2 h-8 drop-shadow-lg' : 'bg-white/50 drop-shadow-lg'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
