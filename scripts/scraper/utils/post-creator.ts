import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ProductData } from '../scrapers/base-scraper'
import { BOT_USER_CONFIG } from '../config'

export class PostCreator {
  private botUserId: string | null = null
  private supabase: SupabaseClient

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables d\'environnement Supabase manquantes')
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Utilise la service role key pour bypasser RLS
    )
  }

  /**
   * Initialise ou récupère le compte bot
   */
  async initBotUser(): Promise<string> {
    if (this.botUserId) {
      return this.botUserId
    }

    // Cherche si le bot existe déjà
    const { data: existingUser } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('username', BOT_USER_CONFIG.username)
      .single()

    if (existingUser) {
      this.botUserId = existingUser.id
      return existingUser.id
    }

    // Crée le compte bot
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: BOT_USER_CONFIG.email,
      email_confirm: true,
      user_metadata: {
        username: BOT_USER_CONFIG.username
      }
    })

    if (authError || !authData.user) {
      throw new Error(`Erreur création bot user: ${authError?.message}`)
    }

    // Crée le profil
    const { error: profileError } = await this.supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: BOT_USER_CONFIG.username,
        height: BOT_USER_CONFIG.height
      })

    if (profileError) {
      throw new Error(`Erreur création profil bot: ${profileError.message}`)
    }

    this.botUserId = authData.user.id
    return authData.user.id
  }

  /**
   * Upload une image vers Supabase Storage
   */
  async uploadImage(imageUrl: string, productName: string): Promise<string> {
    try {
      // Télécharge l'image
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Génère un nom de fichier unique
      const fileName = `scraped/${Date.now()}-${productName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`
      
      // Upload vers Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('outfits')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (error) {
        throw error
      }

      // Récupère l'URL publique
      const { data: { publicUrl } } = this.supabase.storage
        .from('outfits')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Erreur upload image:', error)
      throw error
    }
  }

  /**
   * Crée un post à partir des données produit
   */
  async createPost(product: ProductData, dryRun: boolean = false): Promise<string | null> {
    try {
      const botUserId = await this.initBotUser()

      if (dryRun) {
        console.log('🔍 [DRY RUN] Post qui serait créé:', {
          brand: product.brand,
          name: product.name,
          price: product.price,
          sizes: product.sizes
        })
        return null
      }

      // Upload l'image
      console.log(`📸 Upload image pour ${product.name}...`)
      const imageUrl = await this.uploadImage(product.imageUrl, product.name)

      // Crée le post
      console.log(`📝 Création du post pour ${product.name}...`)
      const { data: outfit, error: outfitError } = await this.supabase
        .from('outfits')
        .insert({
          user_id: botUserId,
          image_url: imageUrl,
          publisher_height: BOT_USER_CONFIG.height,
          publisher_size: BOT_USER_CONFIG.size,
          description: `${product.name} - ${product.price}\n\n${product.description}`
        })
        .select()
        .single()

      if (outfitError || !outfit) {
        throw new Error(`Erreur création outfit: ${outfitError?.message}`)
      }

      // Ajoute les pièces de vêtement
      const clothingPieces = product.sizes.map(size => ({
        outfit_id: outfit.id,
        brand: product.brand,
        product_name: product.name,
        size: size,
        category: product.category || 'Vêtement',
        description: product.description,
        purchase_link: product.productUrl
      }))

      const { error: piecesError } = await this.supabase
        .from('clothing_pieces')
        .insert(clothingPieces)

      if (piecesError) {
        console.error('Erreur ajout clothing pieces:', piecesError)
      }

      console.log(`✅ Post créé avec succès: ${outfit.id}`)
      return outfit.id
    } catch (error) {
      console.error('❌ Erreur création post:', error)
      return null
    }
  }

  /**
   * Crée plusieurs posts en batch
   */
  async createPosts(products: ProductData[], dryRun: boolean = false): Promise<void> {
    console.log(`\n🚀 Création de ${products.length} posts...`)
    
    let successCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        const result = await this.createPost(product, dryRun)
        if (result || dryRun) {
          successCount++
        } else {
          errorCount++
        }
        
        // Petit délai entre chaque création
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Erreur pour ${product.name}:`, error)
        errorCount++
      }
    }

    console.log(`\n📊 Résumé:`)
    console.log(`   ✅ Succès: ${successCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
  }
}
