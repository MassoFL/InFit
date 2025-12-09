#!/usr/bin/env node

/**
 * Script principal pour scraper les sites marchands et créer des posts automatiquement
 * 
 * Usage:
 *   npm run scrape -- --merchant zara --category men --limit 10
 *   npm run scrape -- --dry-run
 *   npm run scrape:all
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Charge les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { MERCHANTS } from './config'
import { PostCreator } from './utils/post-creator'
import { ZaraScraper } from './scrapers/zara-scraper'
import { MockScraper } from './scrapers/mock-scraper'

interface ScraperOptions {
  merchant?: string
  category?: string
  limit?: number
  dryRun?: boolean
}

async function main() {
  const args = process.argv.slice(2)
  const options: ScraperOptions = {
    dryRun: args.includes('--dry-run'),
    limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10'),
    merchant: args.find(arg => arg.startsWith('--merchant='))?.split('=')[1],
    category: args.find(arg => arg.startsWith('--category='))?.split('=')[1]
  }

  console.log('🤖 InFit Auto-Post Scraper')
  console.log('=' .repeat(50))
  console.log(`Mode: ${options.dryRun ? '🔍 DRY RUN (test)' : '🚀 PRODUCTION'}`)
  console.log(`Limite: ${options.limit} produits`)
  
  if (options.merchant) {
    console.log(`Marchand: ${options.merchant}`)
  }
  if (options.category) {
    console.log(`Catégorie: ${options.category}`)
  }
  console.log('=' .repeat(50))

  // Vérification des variables d'environnement
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Variables d\'environnement manquantes!')
    console.error('   Requis: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const postCreator = new PostCreator()

  try {
    // Initialise le bot user
    console.log('\n🔧 Initialisation du compte bot...')
    await postCreator.initBotUser()
    console.log('✅ Compte bot prêt')

    // Détermine quel scraper utiliser
    const merchant = options.merchant || 'mock'
    const category = options.category || 'man'

    let products = []

    if (merchant === 'mock') {
      console.log('\n🎭 Utilisation du Mock Scraper (données de démonstration)...')
      const scraper = new MockScraper()
      products = await scraper.scrapeCategory(category, options.limit)
    } else if (merchant === 'zara') {
      console.log('\n🛍️  Scraping Zara (peut échouer si le site a changé)...')
      const scraper = new ZaraScraper()
      
      try {
        products = await scraper.scrapeCategory(category, options.limit)
        await scraper.close()
      } catch (error) {
        console.error('❌ Erreur scraping:', error)
        await scraper.close()
      }
    } else {
      console.log(`\n⚠️  Scraper pour ${merchant} pas encore implémenté`)
      console.log('📝 Marchands disponibles: mock, zara')
      console.log('\n💡 Recommandation:')
      console.log('   - Utiliser --merchant=mock pour tester')
      console.log('   - Utiliser les APIs officielles pour la production')
    }

    // Crée les posts
    if (products.length > 0) {
      await postCreator.createPosts(products, options.dryRun)
    } else {
      console.log('\n⚠️  Aucun produit trouvé')
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  }
}

// Exécute le script
if (require.main === module) {
  main().catch(console.error)
}

export { main }
