'use client'

import { usePathname } from 'next/navigation'

interface FeedNavTabsProps {
  activeTab: 'following' | 'for-you'
  onTabChange: (tab: 'following' | 'for-you') => void
}

export default function FeedNavTabs({ activeTab, onTabChange }: FeedNavTabsProps) {
  const pathname = usePathname()
  
  // Only show tabs on feed page
  if (pathname !== '/feed') return null

  return (
    <div className="flex gap-6">
      <button
        onClick={() => onTabChange('following')}
        className={`pb-1 ${
          activeTab === 'following'
            ? 'border-b-2 border-black font-semibold text-black'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Abonnements
      </button>
      <button
        onClick={() => onTabChange('for-you')}
        className={`pb-1 ${
          activeTab === 'for-you'
            ? 'border-b-2 border-black font-semibold text-black'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Pour Toi
      </button>
    </div>
  )
}
