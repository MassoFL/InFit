export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  height?: number // cm
  weight?: number // kg
}

export interface ClothingPiece {
  id: string
  brand: string
  product_name: string
  size: string
  category?: string
  description?: string
  purchase_link?: string
}

export interface OutfitImage {
  id: string
  outfit_id: string
  image_url: string
  display_order: number
}

export interface Outfit {
  id: string
  user_id: string
  image_url: string
  publisher_height: number
  publisher_size: string
  description?: string
  clothing_pieces: ClothingPiece[]
  outfit_images?: OutfitImage[]
  created_at: string
  user?: User
  likes_count?: number
  is_liked?: boolean
  is_saved?: boolean
  saves_count?: number
  is_following?: boolean
  reposts_count?: number
  is_reposted?: boolean
  reposted_by?: User
  original_user?: User
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}
