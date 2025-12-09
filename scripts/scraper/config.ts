// Configuration des marchands à scraper

export interface MerchantConfig {
  name: string
  baseUrl: string
  enabled: boolean
  categories: string[]
  selectors: {
    productList: string
    productLink: string
    productImage: string
    productName: string
    productPrice: string
    productSize: string
    productDescription: string
  }
  rateLimit: number // ms entre chaque requête
}

export const MERCHANTS: Record<string, MerchantConfig> = {
  zara: {
    name: 'Zara',
    baseUrl: 'https://www.zara.com',
    enabled: true,
    categories: ['man', 'woman'],
    selectors: {
      productList: '.product-grid-product',
      productLink: '.product-link',
      productImage: '.media-image',
      productName: '.product-detail-info__header-name',
      productPrice: '.price__amount',
      productSize: '.product-size-info__main-label',
      productDescription: '.product-detail-info__description'
    },
    rateLimit: 2000
  },
  
  hm: {
    name: 'H&M',
    baseUrl: 'https://www2.hm.com',
    enabled: true,
    categories: ['men', 'ladies'],
    selectors: {
      productList: '.product-item',
      productLink: '.item-link',
      productImage: '.item-image',
      productName: '.item-heading',
      productPrice: '.item-price',
      productSize: '.product-sizes',
      productDescription: '.product-description'
    },
    rateLimit: 2000
  },
  
  asos: {
    name: 'ASOS',
    baseUrl: 'https://www.asos.com',
    enabled: false, // Désactivé par défaut - utiliser l'API officielle
    categories: ['men', 'women'],
    selectors: {
      productList: '[data-auto-id="productList"]',
      productLink: '[data-auto-id="productTile"]',
      productImage: 'img[data-auto-id="productTileImage"]',
      productName: '[data-auto-id="productTitle"]',
      productPrice: '[data-auto-id="productPrice"]',
      productSize: '.size-select',
      productDescription: '.product-description'
    },
    rateLimit: 3000
  }
}

export const SCRAPER_CONFIG = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  maxConcurrent: 3,
  timeout: 30000,
  retries: 3,
  headless: true
}

// Compte bot pour créer les posts
export const BOT_USER_CONFIG = {
  email: 'bot@infit.app',
  username: 'InFit_Official',
  height: 180,
  size: 'M'
}
