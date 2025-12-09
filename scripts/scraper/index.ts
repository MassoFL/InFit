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

    // TODO: Implémenter les scrapers spécifiques
    console.log('\n⚠️  Les scrapers spécifiques ne sont pas encore implémentés')
    console.log('📝 Prochaines étapes:')
    console.log('   1. Installer Puppeteer: npm install puppeteer')
    console.log('   2. Implémenter les scrapers dans scripts/scraper/scrapers/')
    console.log('   3. Ou utiliser les APIs officielles des marchands')
    console.log('\n💡 Recommandation: Utiliser les APIs d\'affiliation officielles')
    console.log('   - ASOS Partner API')
    console.log('   - Zalando Partner Program')
    console.log('   - Amazon Product Advertising API')

    // Exemple de données mockées pour tester
    if (options.dryRun) {
      const mockProducts = [
        {
          name: 'T-shirt basique blanc',
          brand: 'Zara',
          price: '12.99€',
          imageUrl: 'https://via.placeholder.com/800x1200',
          productUrl: 'https://www.zara.com/example',
          sizes: ['S', 'M', 'L', 'XL'],
          description: 'T-shirt en coton 100% biologique',
          category: 'T-shirts'
        },
        {
          name: 'Jean slim noir',
          brand: 'H&M',
          price: '29.99€',
          imageUrl: 'https://via.placeholder.com/800x1200',
          productUrl: 'https://www2.hm.com/example',
          sizes: ['28', '30', '32', '34'],
          description: 'Jean slim fit en denim stretch',
          category: 'Jeans'
        }
      ]

      await postCreator.createPosts(mockProducts, true)
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
