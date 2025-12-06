import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OutfitCard from '@/components/OutfitCard'
import NavMenu from '@/components/NavMenu'
import FollowButton from '@/components/FollowButton'
import Link from 'next/link'
import { Outfit } from '@/types'

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
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

  // Get user profile by username
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!userProfile) {
    redirect('/feed')
  }

  const isOwnProfile = session.user.id === userProfile.id

  // Check if current user follows this profile
  const { data: followData } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', session.user.id)
    .eq('following_id', userProfile.id)
    .single()

  const isFollowing = !!followData

  // Get followers and following counts
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userProfile.id)

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userProfile.id)

  const followersCount = followers?.length || 0
  const followingCount = following?.length || 0

  // Fetch user's outfits
  const { data: outfits } = await supabase
    .from('outfits')
    .select(`
      *,
      profiles!outfits_user_id_fkey(*),
      clothing_pieces(*),
      outfit_images(*)
    `)
    .eq('user_id', userProfile.id)
    .order('created_at', { ascending: false })

  // Check which outfits current user has liked
  const { data: userLikes } = await supabase
    .from('likes')
    .select('outfit_id')
    .eq('user_id', session.user.id)

  const likedOutfitIds = new Set(userLikes?.map((l: any) => l.outfit_id) || [])

  // Get likes count for each outfit
  const { data: likesCount } = await supabase
    .from('likes')
    .select('outfit_id')

  const likesMap = new Map()
  likesCount?.forEach((like: any) => {
    likesMap.set(like.outfit_id, (likesMap.get(like.outfit_id) || 0) + 1)
  })

  const outfitsWithLikes: Outfit[] = outfits?.map((outfit: any) => ({
    ...outfit,
    user: outfit.profiles,
    likes_count: likesMap.get(outfit.id) || 0,
    is_liked: likedOutfitIds.has(outfit.id)
  })) || []

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/feed" className="text-2xl font-bold text-black">
            InFit
          </Link>
          <NavMenu />
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-2xl">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt={userProfile.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{userProfile.username[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black">@{userProfile.username}</h1>
              <div className="flex gap-4 text-sm text-black mt-1">
                <span>{outfitsWithLikes.length} outfit{outfitsWithLikes.length > 1 ? 's' : ''}</span>
                <span>{followersCount} abonné{followersCount > 1 ? 's' : ''}</span>
                <span>{followingCount} abonnement{followingCount > 1 ? 's' : ''}</span>
              </div>
            </div>
            {!isOwnProfile && (
              <FollowButton
                userId={userProfile.id}
                currentUserId={session.user.id}
                initialIsFollowing={isFollowing}
              />
            )}
          </div>
        </div>

        {/* User's Outfits */}
        <div className="space-y-6">
          {outfitsWithLikes.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} currentUserId={session.user.id} />
          ))}
        </div>

        {outfitsWithLikes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black">Aucun outfit pour le moment</p>
          </div>
        )}
      </div>
    </main>
  )
}
