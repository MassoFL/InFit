'use client'

import OutfitCard from './OutfitCard'
import { Outfit } from '@/types'

interface FeedTabsProps {
  followingOutfits: Outfit[]
  allOutfits: Outfit[]
  currentUserId: string
  activeTab: 'following' | 'for-you'
}

export default function FeedTabs({ followingOutfits, allOutfits, currentUserId, activeTab }: FeedTabsProps) {
  const outfitsToShow = activeTab === 'following' ? followingOutfits : allOutfits

  return (
    <>
      {/* Outfits */}
      <div className="space-y-6">
        {outfitsToShow.map((outfit: any) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            currentUserId={currentUserId}
            isSaved={outfit.is_saved}
            savesCount={outfit.saves_count}
            isFollowing={outfit.is_following}
          />
        ))}
      </div>

      {outfitsToShow.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-black mb-4">
            {activeTab === 'following'
              ? 'Aucun outfit de vos abonnements. Suivez des utilisateurs pour voir leurs outfits ici !'
              : 'Aucun outfit pour le moment'}
          </p>
        </div>
      )}
    </>
  )
}
