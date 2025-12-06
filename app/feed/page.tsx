import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import FeedPageClient from '@/app/feed/FeedPageClient'

export default async function FeedPage() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/')
  }

  // Fetch outfits with user info and clothing pieces
  const { data: outfits, error: outfitsError } = await supabase
    .from('outfits')
    .select(`
      *,
      profiles!outfits_user_id_fkey(*),
      clothing_pieces(*),
      outfit_images(*)
    `)
    .order('created_at', { ascending: false })

  console.log('Outfits query:', { outfits, outfitsError })

  // Check which outfits current user has liked
  const { data: userLikes } = await supabase
    .from('likes')
    .select('outfit_id')
    .eq('user_id', session.user.id)

  const likedOutfitIds = new Set(userLikes?.map((l: any) => l.outfit_id) || [])

  // Check which outfits current user has saved
  const { data: userSaves } = await supabase
    .from('saves')
    .select('outfit_id')
    .eq('user_id', session.user.id)

  const savedOutfitIds = new Set(userSaves?.map((s: any) => s.outfit_id) || [])

  // Check which users current user is following
  const { data: userFollows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', session.user.id)

  const followingIds = new Set(userFollows?.map((f: any) => f.following_id) || [])

  // Get likes count for each outfit
  const { data: likesCount } = await supabase
    .from('likes')
    .select('outfit_id')

  const likesMap = new Map()
  likesCount?.forEach((like: any) => {
    likesMap.set(like.outfit_id, (likesMap.get(like.outfit_id) || 0) + 1)
  })

  // Get saves count for each outfit
  const { data: savesCount } = await supabase
    .from('saves')
    .select('outfit_id')

  const savesMap = new Map()
  savesCount?.forEach((save: any) => {
    savesMap.set(save.outfit_id, (savesMap.get(save.outfit_id) || 0) + 1)
  })

  const outfitsWithLikes = outfits?.map((outfit: any) => ({
    ...outfit,
    user: outfit.profiles,
    likes_count: likesMap.get(outfit.id) || 0,
    is_liked: likedOutfitIds.has(outfit.id),
    is_saved: savedOutfitIds.has(outfit.id),
    saves_count: savesMap.get(outfit.id) || 0,
    is_following: followingIds.has(outfit.user_id)
  })) || []

  // Filter outfits from followed users
  const followingOutfits = outfitsWithLikes.filter((outfit: any) => 
    followingIds.has(outfit.user_id)
  )

  return (
    <FeedPageClient 
      followingOutfits={followingOutfits}
      allOutfits={outfitsWithLikes}
      currentUserId={session.user.id}
    />
  )
}
