import { MerchantConfig } from '../config'

export interface ProductData {
  name: string
  brand: string
  price: string
  imageUrl: string
  productUrl: string
  sizes: string[]
  description: string
  category?: string
}

export abstract class BaseScraper {
  protected config: MerchantConfig
  protected lastRequestTime: number = 0

  constructor(config: MerchantConfig) {
    this.config = config
  }

  /**
   * Respecte le rate limiting
   */
  protected async respectRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.config.rateLimit) {
      const waitTime = this.config.rateLimit - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
  }

  /**
   * Méthode abstraite à implémenter par chaque scraper
   */
  abstract scrapeCategory(category: string, limit?: number): Promise<ProductData[]>

  /**
   * Méthode abstraite pour scraper un produit spécifique
   */
  abstract scrapeProduct(url: string): Promise<ProductData | null>

  /**
   * Nettoie et normalise les données du produit
   */
  protected normalizeProductData(data: Partial<ProductData>): ProductData | null {
    if (!data.name || !data.imageUrl || !data.productUrl) {
      console.warn('Données produit incomplètes:', data)
      return null
    }

    return {
      name: data.name.trim(),
      brand: data.brand?.trim() || this.config.name,
      price: data.price?.trim() || 'Prix non disponible',
      imageUrl: this.normalizeImageUrl(data.imageUrl),
      productUrl: this.normalizeProductUrl(data.productUrl),
      sizes: data.sizes || [],
      description: data.description?.trim() || '',
      category: data.category
    }
  }

  /**
   * Normalise l'URL de l'image
   */
  protected normalizeImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }
    if (url.startsWith('//')) {
      return 'https:' + url
    }
    return this.config.baseUrl + url
  }

  /**
   * Normalise l'URL du produit
   */
  protected normalizeProductUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }
    return this.config.baseUrl + url
  }

  /**
   * Extrait les tailles disponibles
   */
  protected extractSizes(sizeText: string): string[] {
    const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const found: string[] = []
    
    for (const size of commonSizes) {
      if (sizeText.includes(size)) {
        found.push(size)
      }
    }
    
    return found.length > 0 ? found : ['M'] // Default à M si aucune taille trouvée
  }
}
