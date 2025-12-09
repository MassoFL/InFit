'use client'

import { Outfit } from '@/types'
import { createSupabaseClient } from '@/lib/supabase'
import { useState } from 'react'
import Link from 'next/link'

export default function OutfitCard({ outfit, currentUserId, isSaved: initialIsSaved, savesCount: initialSavesCount, isFollowing: initialIsFollowing, isReposted: initialIsReposted, repostsCount: initialRepostsCount }: { outfit: Outfit; currentUserId?: string; isSaved?: boolean; savesCount?: number; isFollowing?: boolean; isReposted?: boolean; repostsCount?: number }) {
  const [isLiked, setIsLiked] = useState(outfit.is_liked || false)
  const [likesCount, setLikesCount] = useState(outfit.likes_count || 0)
  const [isSaved, setIsSaved] = useState(initialIsSaved || false)
  const [savesCount, setSavesCount] = useState(initialSavesCount || 0)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false)
  const [isReposted, setIsReposted] = useState(initialIsReposted || false)
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount || 0)
  const [showDetails, setShowDetails] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(outfit.description || '')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const supabase = createSupabaseClient()
  
  const isOwner = currentUserId === outfit.user_id
  
  // Handle horizontal swipe to open details
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const diffX = touchStartX - touchEndX
    const diffY = Math.abs(touchStartY - touchEndY)
    
    // Swipe left to open details (horizontal swipe > 50px and vertical < 30px)
    if (diffX > 50 && diffY < 30) {
      setShowDetails(true)
      window.dispatchEvent(new Event('outfitDetailsOpen'))
    }
    // Swipe right to close details
    else if (diffX < -50 && diffY < 30 && showDetails) {
      setShowDetails(false)
      window.dispatchEvent(new Event('outfitDetailsClose'))
    }
  }
  
  // Combine main image with additional images
  const allImages = [
    outfit.image_url,
    ...(outfit.outfit_images?.sort((a, b) => a.display_order - b.display_order).map(img => img.image_url) || [])
  ]
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const toggleLike = async () => {
    if (!currentUserId) return

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUserId)
          .eq('outfit_id', outfit.id)
        setLikesCount(prev => prev - 1)
      } else {
        await supabase
          .from('likes')
          .insert({ user_id: currentUserId, outfit_id: outfit.id })
        setLikesCount(prev => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const toggleSave = async () => {
    if (!currentUserId) return

    try {
      if (isSaved) {
        await supabase
          .from('saves')
          .delete()
          .eq('user_id', currentUserId)
          .eq('outfit_id', outfit.id)
        setSavesCount(prev => prev - 1)
      } else {
        await supabase
          .from('saves')
          .insert({ user_id: currentUserId, outfit_id: outfit.id })
        setSavesCount(prev => prev + 1)
      }
      setIsSaved(!isSaved)
    } catch (err) {
      console.error('Error toggling save:', err)
    }
  }

  const toggleRepost = async () => {
    if (!currentUserId) return

    try {
      if (isReposted) {
        await supabase
          .from('reposts')
          .delete()
          .eq('user_id', currentUserId)
          .eq('outfit_id', outfit.id)
        setRepostsCount(prev => prev - 1)
      } else {
        await supabase
          .from('reposts')
          .insert({ user_id: currentUserId, outfit_id: outfit.id })
        setRepostsCount(prev => prev + 1)
      }
      setIsReposted(!isReposted)
    } catch (err) {
      console.error('Error toggling repost:', err)
    }
  }

  const toggleFollow = async () => {
    if (!currentUserId || !outfit.user_id) return

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', outfit.user_id)
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: outfit.user_id })
      }
      setIsFollowing(!isFollowing)
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tenue ?')) return

    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfit.id)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error('Error deleting outfit:', err)
      alert('Échec de la suppression de la tenue')
    }
  }

  const handleSaveDescription = async () => {
    try {
      const { error } = await supabase
        .from('outfits')
        .update({ description })
        .eq('id', outfit.id)

      if (error) throw error
      setIsEditing(false)
      alert('Description mise à jour !')
    } catch (err) {
      console.error('Error updating description:', err)
      alert('Échec de la mise à jour de la description')
    }
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden" 
      style={{ touchAction: 'pan-y', height: '100dvh' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background blur effect - artistic fill for margins */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={allImages[currentImageIndex]}
          alt="Background blur"
          className="w-full h-full object-cover scale-110 blur-3xl opacity-60"
          draggable="false"
        />
      </div>
      
      {/* Image principale - plein écran avec effet de couture */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative max-w-full max-h-full">
          <img
            src={allImages[currentImageIndex]}
            alt="Outfit"
            className="max-w-full max-h-[100dvh] object-contain pointer-events-none select-none"
            draggable="false"
          />
          

        </div>
        
        {/* Indicateurs d'images */}
        {allImages.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {allImages.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Overlay avec infos de base - en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <div className="p-4">
          <div className="mb-3">
            {outfit.reposted_by && (
              <div className="text-white/70 text-xs mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/>
                </svg>
                Republié par @{outfit.reposted_by.username}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/user/${outfit.original_user?.username || outfit.user?.username}`} className="text-xl font-bold text-white hover:underline drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  @{outfit.original_user?.username || outfit.user?.username}
                </Link>
                {!isOwner && (
                  <button
                    onClick={toggleFollow}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isFollowing 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : 'bg-white text-black'
                    }`}
                  >
                    {isFollowing ? 'Abonné' : 'S\'abonner'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-white text-sm mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {outfit.publisher_height}cm • Taille {outfit.publisher_size}
          </div>
          
          {outfit.description && (
            <p className="text-white text-sm line-clamp-2 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{outfit.description}</p>
          )}
          
          {/* Indicateur de swipe */}
          <div className="flex items-center gap-2 text-white/70 text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <span>←</span>
            <span>Glisser pour voir les articles</span>
          </div>
        </div>
      </div>
      
      {/* Actions - côté droit */}
      <div className="absolute right-4 flex flex-col gap-6 z-10" style={{ bottom: 'max(8rem, calc(8rem + env(safe-area-inset-bottom)))' }}>
        <button
          onClick={toggleLike}
          className="flex flex-col items-center hover:scale-110 transition-transform"
        >
          {isLiked ? (
            <svg className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="#ffffff" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          )}
          <span 
            className="text-white text-sm font-medium mt-1"
            style={{
              textShadow: '0 0 4px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)'
            }}
          >
            {likesCount}
          </span>
        </button>
        
        <button
          onClick={toggleSave}
          className="flex flex-col items-center hover:scale-110 transition-transform"
        >
          {isSaved ? (
            <svg className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="#ffffff" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
          )}
          <span 
            className="text-white text-sm font-medium mt-1"
            style={{
              textShadow: '0 0 4px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)'
            }}
          >
            {savesCount}
          </span>
        </button>
        
        <button
          onClick={toggleRepost}
          className="flex flex-col items-center hover:scale-110 transition-transform"
        >
          {isReposted ? (
            <svg className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="#ffffff" viewBox="0 0 24 24">
              <path d="M6 6v2h8.59L5 17.59 6.41 19 16 9.41V18h2V6z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" fill="none" stroke="#ffffff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/>
            </svg>
          )}
          <span 
            className="text-white text-sm font-medium mt-1"
            style={{
              textShadow: '0 0 4px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)'
            }}
          >
            {repostsCount}
          </span>
        </button>
      </div>
      
      {/* Panneau latéral des détails - glisse depuis la droite */}
      <div 
        className={`absolute top-0 right-0 h-full w-full bg-white transform transition-transform duration-300 ease-out z-20 ${
          showDetails ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Header du panneau */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">Détails de la tenue</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-black hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Info utilisateur */}
            <div className="flex items-center justify-between pb-4 border-b">
              <Link href={`/user/${outfit.user?.username}`} className="text-lg font-bold text-black hover:underline">
                @{outfit.user?.username}
              </Link>
              {!isOwner && (
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isFollowing 
                      ? 'bg-gray-200 text-black' 
                      : 'bg-black text-white'
                  }`}
                >
                  {isFollowing ? 'Abonné' : 'S\'abonner'}
                </button>
              )}
            </div>
            
            {/* Mensurations */}
            <div className="pb-4 border-b">
              <h4 className="font-semibold text-black mb-2">Mensurations</h4>
              <div className="text-sm text-black">
                Taille : {outfit.publisher_height}cm • {outfit.publisher_size}
              </div>
            </div>
            
            {/* Description */}
            <div className="pb-4 border-b">
              {isEditing ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm text-black"
                    rows={3}
                    placeholder="Ajouter une description..."
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveDescription}
                      className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setDescription(outfit.description || '')
                      }}
                      className="bg-gray-200 text-black px-4 py-2 rounded text-sm hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-black mb-2">Description</h4>
                  {outfit.description ? (
                    <p className="text-sm text-black">{outfit.description}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Aucune description</p>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-black hover:underline mt-2"
                    >
                      {outfit.description ? 'Modifier' : 'Ajouter une description'}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Articles */}
            {outfit.clothing_pieces && outfit.clothing_pieces.length > 0 && (
              <div>
                <h4 className="font-semibold text-black mb-3">Articles ({outfit.clothing_pieces.length})</h4>
                <div className="space-y-4">
                  {outfit.clothing_pieces.map((piece) => (
                    <div key={piece.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium text-black mb-2">
                        {piece.brand}
                        {piece.product_name && ` - ${piece.product_name}`}
                      </div>
                      <div className="text-sm text-black mb-2">
                        Taille : {piece.size}
                        {piece.category && ` • ${piece.category}`}
                      </div>
                      {piece.description && (
                        <p className="text-sm text-gray-600 mb-3">{piece.description}</p>
                      )}
                      {piece.purchase_link && (
                        <a
                          href={piece.purchase_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
                        >
                          Acheter →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Indicateur animé pour swiper - visible quand fermé */}
      {!showDetails && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex gap-1.5 items-center pointer-events-none">
          {[0, 1, 2, 3].map((index) => {
            // Tailles: 0.5rem, 0.65rem, 0.8rem, 1.2rem (la dernière plus grande)
            const sizes = [0.5, 0.65, 0.8, 1.2];
            const size = sizes[index];
            return (
              <svg 
                key={index}
                className="text-white animate-pulse" 
                style={{ 
                  width: `${size}rem`,
                  height: `${size}rem`,
                  animationDelay: `${index * 150}ms`, 
                  animationDuration: '2s',
                  opacity: 0.3 + (index * 0.2),
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5)) drop-shadow(0 1px 3px rgba(0,0,0,0.4))'
                }}
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            );
          })}
        </div>
      )}
    </div>
  )
}
