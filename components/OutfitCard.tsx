'use client'

import { Outfit } from '@/types'
import { createSupabaseClient } from '@/lib/supabase'
import { useState } from 'react'
import Link from 'next/link'

export default function OutfitCard({ outfit, currentUserId, isSaved: initialIsSaved, savesCount: initialSavesCount, isFollowing: initialIsFollowing }: { outfit: Outfit; currentUserId?: string; isSaved?: boolean; savesCount?: number; isFollowing?: boolean }) {
  const [isLiked, setIsLiked] = useState(outfit.is_liked || false)
  const [likesCount, setLikesCount] = useState(outfit.likes_count || 0)
  const [isSaved, setIsSaved] = useState(initialIsSaved || false)
  const [savesCount, setSavesCount] = useState(initialSavesCount || 0)
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false)
  const [showDetails, setShowDetails] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(outfit.description || '')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const supabase = createSupabaseClient()
  
  const isOwner = currentUserId === outfit.user_id
  
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
    <div className="relative w-full h-full overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Image principale - plein écran */}
      <div className="absolute inset-0 bg-white" style={{ touchAction: 'none' }}>
        <img
          src={allImages[currentImageIndex]}
          alt="Outfit"
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable="false"
        />
        
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
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href={`/user/${outfit.user?.username}`} className="text-xl font-bold text-white hover:underline drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                @{outfit.user?.username}
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
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
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
      
      {/* Bouton pour ouvrir le panneau - visible quand fermé */}
      {!showDetails && (
        <button
          onClick={() => setShowDetails(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all z-10"
        >
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      )}
    </div>
  )
}
