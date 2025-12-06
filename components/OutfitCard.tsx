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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full bg-gray-100">
        <img
          src={allImages[currentImageIndex]}
          alt="Outfit"
          className="w-full h-auto"
        />
        
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              →
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <Link href={`/user/${outfit.user?.username}`} className="text-lg font-bold text-black hover:underline">
              @{outfit.user?.username}
            </Link>
            {!isOwner && (
              <button
                onClick={toggleFollow}
                className={`text-xs font-light hover:underline ${isFollowing ? 'text-gray-400' : 'text-black'}`}
              >
                {isFollowing ? 'Abonné' : 'S\'abonner'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLike}
              className="flex flex-col items-center hover:opacity-70"
            >
              {isLiked ? (
                <svg className="w-6 h-6" fill="#000000" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="#000000" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              )}
              <span className="text-xs text-black">{likesCount}</span>
            </button>
            <button
              onClick={toggleSave}
              className="flex flex-col items-center hover:opacity-70"
            >
              {isSaved ? (
                <svg className="w-6 h-6" fill="#000000" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="#000000" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                </svg>
              )}
              <span className="text-xs text-black">{savesCount}</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-black mb-3">
          <div>{outfit.publisher_height}cm</div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center text-black hover:text-gray-600 mb-3"
        >
          {showDetails ? '▲' : '▼'}
        </button>

        {showDetails && (
          <div className="space-y-3">
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
                    className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setDescription(outfit.description || '')
                    }}
                    className="bg-gray-200 text-black px-3 py-1 rounded text-sm hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {outfit.description && <p className="text-sm text-black mb-2">{outfit.description}</p>}
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-black hover:underline"
                  >
                    {outfit.description ? 'Modifier la description' : 'Ajouter une description'}
                  </button>
                )}
              </div>
            )}

            {outfit.clothing_pieces && outfit.clothing_pieces.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-sm font-semibold text-black mb-2">Articles :</div>
                <div className="space-y-3">
                  {outfit.clothing_pieces.map((piece) => (
                    <div key={piece.id} className="text-sm bg-gray-50 p-3 rounded">
                      <div className="font-medium text-black mb-1">
                        {piece.brand}
                        {piece.product_name && ` - ${piece.product_name}`}
                      </div>
                      <div className="text-black mb-2">
                        Taille : {piece.size}
                        {piece.category && ` • ${piece.category}`}
                      </div>
                      {piece.description && (
                        <p className="text-black text-xs mb-2">{piece.description}</p>
                      )}
                      {piece.purchase_link && (
                        <a
                          href={piece.purchase_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-black text-white px-4 py-1.5 rounded text-xs hover:bg-gray-800"
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
        )}
      </div>
    </div>
  )
}
