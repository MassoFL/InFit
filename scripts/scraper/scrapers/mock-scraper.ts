import { BaseScraper, ProductData } from './base-scraper'
import { MERCHANTS } from '../config'

/**
 * Mock Scraper pour démonstration
 * Génère des données réalistes sans scraper de vrais sites
 */
export class MockScraper extends BaseScraper {
  constructor() {
    super(MERCHANTS.zara)
  }

  /**
   * Génère des produits mockés
   */
  async scrapeCategory(category: string, limit: number = 10): Promise<ProductData[]> {
    console.log(`🎭 Génération de ${limit} produits mockés...`)
    
    const products: ProductData[] = []
    
    const mockProducts = [
      {
        name: 'T-shirt basique en coton',
        price: '12.99€',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        description: 'T-shirt 100% coton biologique, coupe regular',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        category: 'T-shirts'
      },
      {
        name: 'Jean slim fit noir',
        price: '39.99€',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        description: 'Jean slim en denim stretch confortable',
        sizes: ['28', '30', '32', '34', '36'],
        category: 'Jeans'
      },
      {
        name: 'Chemise oxford blanche',
        price: '29.99€',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        description: 'Chemise classique en coton oxford',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Chemises'
      },
      {
        name: 'Pull col rond gris',
        price: '34.99€',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        description: 'Pull en laine mérinos, doux et chaud',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        category: 'Pulls'
      },
      {
        name: 'Pantalon chino beige',
        price: '44.99€',
        imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        description: 'Chino coupe slim, tissu stretch',
        sizes: ['28', '30', '32', '34', '36'],
        category: 'Pantalons'
      },
      {
        name: 'Veste en jean bleu',
        price: '59.99€',
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        description: 'Veste en denim classique, coupe regular',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Vestes'
      },
      {
        name: 'Sweat à capuche noir',
        price: '39.99€',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        description: 'Sweat confortable en coton molletonné',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        category: 'Sweats'
      },
      {
        name: 'Polo blanc classique',
        price: '24.99€',
        imageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
        description: 'Polo en piqué de coton, col boutonné',
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Polos'
      }
    ]

    for (let i = 0; i < Math.min(limit, mockProducts.length); i++) {
      await this.respectRateLimit()
      
      const mock = mockProducts[i]
      const product = this.normalizeProductData({
        name: mock.name,
        brand: 'Zara',
        price: mock.price,
        imageUrl: mock.imageUrl,
        productUrl: `https://www.zara.com/fr/fr/product-${1000 + i}.html`,
        sizes: mock.sizes,
        description: mock.description,
        category: mock.category
      })

      if (product) {
        products.push(product)
        console.log(`   ✅ ${i + 1}/${limit} - ${product.name} - ${product.price}`)
      }
    }

    return products
  }

  /**
   * Scrape un produit spécifique (mock)
   */
  async scrapeProduct(url: string): Promise<ProductData | null> {
    return null
  }
}
