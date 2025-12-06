'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import OutfitCard from '@/components/OutfitCard'
import NavMenu from '@/components/NavMenu'
import type { User } from '@/types'
import type { Outfit } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isEditingHeight, setIsEditingHeight] = useState(false)
  const [isEditingWeight, setIsEditingWeight] = useState(false)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([])
  const [activeTab, setActiveTab] = useState<'my-outfits' | 'saved'>('my-outfits')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          email: authUser.email!,
          username: profile.username,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          height: profile.height,
          weight: profile.weight
        })
        setHeight(profile.height?.toString() || '')
        setWeight(profile.weight?.toString() || '')

        // Load user's outfits
        const { data: userOutfits } = await supabase
          .from('outfits')
          .select(`
            *,
            profiles!outfits_user_id_fkey(*),
            clothing_pieces(*),
            outfit_images(*)
          `)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        // Get likes info
        const { data: userLikes } = await supabase
          .from('likes')
          .select('outfit_id')
          .eq('user_id', authUser.id)

        const likedOutfitIds = new Set(userLikes?.map((l: any) => l.outfit_id) || [])

        const { data: likesCount } = await supabase
          .from('likes')
          .select('outfit_id')

        const likesMap = new Map()
        likesCount?.forEach((like: any) => {
          likesMap.set(like.outfit_id, (likesMap.get(like.outfit_id) || 0) + 1)
        })

        // Get saves count
        const { data: savesCount } = await supabase
          .from('saves')
          .select('outfit_id')

        const savesMap = new Map()
        savesCount?.forEach((save: any) => {
          savesMap.set(save.outfit_id, (savesMap.get(save.outfit_id) || 0) + 1)
        })

        const outfitsWithLikes: Outfit[] = userOutfits?.map((outfit: any) => ({
          ...outfit,
          user: outfit.profiles,
          likes_count: likesMap.get(outfit.id) || 0,
          is_liked: likedOutfitIds.has(outfit.id),
          saves_count: savesMap.get(outfit.id) || 0
        })) || []

        setOutfits(outfitsWithLikes)

        // Load saved outfits
        const { data: saves } = await supabase
          .from('saves')
          .select(`
            outfit_id,
            outfits (
              *,
              profiles!outfits_user_id_fkey(*),
              clothing_pieces(*),
              outfit_images(*)
            )
          `)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        const savedOutfitsData = saves?.map((save: any) => ({
          ...save.outfits,
          user: save.outfits.profiles,
          likes_count: likesMap.get(save.outfits.id) || 0,
          is_liked: likedOutfitIds.has(save.outfits.id),
          is_saved: true,
          saves_count: savesMap.get(save.outfits.id) || 0
        })) || []

        setSavedOutfits(savedOutfitsData)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHeight = async () => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ height: height ? parseInt(height) : null })
      .eq('id', user.id)
    if (!error) {
      setIsEditingHeight(false)
      await loadProfile()
    }
  }

  const handleSaveWeight = async () => {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ weight: weight ? parseInt(weight) : null })
      .eq('id', user.id)
    if (!error) {
      setIsEditingWeight(false)
      await loadProfile()
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return

    setUploading(true)
    try {
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('infit')
        .upload(`avatars/${fileName}`, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('infit')
        .getPublicUrl(`avatars/${fileName}`)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      await loadProfile()
      alert('Photo de profil mise à jour !')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Échec de l\'upload de la photo')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-black">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold text-black">
            InFit
          </Link>
          <NavMenu />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* User Info with Height & Weight */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.username[0].toUpperCase()}</span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-black text-white rounded-full p-1 cursor-pointer hover:bg-gray-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-black">{user.username}</h2>
              <p className="text-sm text-black mb-2">{user.email}</p>
              <p className="text-sm text-black">{outfits.length} outfit{outfits.length > 1 ? 's' : ''}</p>
              {uploading && <p className="text-sm text-black">Upload en cours...</p>}
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Taille (cm)</label>
              {isEditingHeight ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-black"
                  />
                  <button onClick={handleSaveHeight} className="text-black">✓</button>
                  <button onClick={() => setIsEditingHeight(false)} className="text-black">✕</button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingHeight(true)}
                  className="text-black cursor-pointer hover:underline"
                >
                  {user.height || 'Non renseigné'}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Poids (kg)</label>
              {isEditingWeight ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-black"
                  />
                  <button onClick={handleSaveWeight} className="text-black">✓</button>
                  <button onClick={() => setIsEditingWeight(false)} className="text-black">✕</button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingWeight(true)}
                  className="text-black cursor-pointer hover:underline"
                >
                  {user.weight || 'Non renseigné'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('my-outfits')}
            className={`pb-2 px-4 ${activeTab === 'my-outfits' ? 'border-b-2 border-black font-semibold text-black' : 'text-gray-500'}`}
          >
            Mes Outfits ({outfits.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 px-4 ${activeTab === 'saved' ? 'border-b-2 border-black font-semibold text-black' : 'text-gray-500'}`}
          >
            Enregistrés ({savedOutfits.length})
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'my-outfits' ? (
          <>
            <div className="space-y-6">
              {outfits.map((outfit: any) => (
                <OutfitCard key={outfit.id} outfit={outfit} currentUserId={user.id} isSaved={false} savesCount={outfit.saves_count || 0} />
              ))}
            </div>
            {outfits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-black mb-4">Aucun outfit pour le moment</p>
                <Link href="/create" className="text-black hover:underline">
                  Créer votre premier outfit
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-6">
              {savedOutfits.map((outfit: any) => (
                <OutfitCard key={outfit.id} outfit={outfit} currentUserId={user.id} isSaved={true} savesCount={outfit.saves_count || 0} />
              ))}
            </div>
            {savedOutfits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-black">Aucun outfit enregistré</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
