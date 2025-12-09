import puppeteer, { Browser, Page } from 'puppeteer'
import { BaseScraper, ProductData } from './base-scraper'
import { MERCHANTS } from '../config'

export class ZaraScraper extends BaseScraper {
  private browser: Browser | null = null

  constructor() {
    super(MERCHANTS.zara)
  }

  /**
   * Initialise le navigateur Puppeteer
   */
  private async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    return this.browser
  }

  /**
   * Ferme le navigateur
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Scrape une catégorie de produits
   */
  async scrapeCategory(category: string, limit: number = 10): Promise<ProductData[]> {
    const browser = await this.initBrowser()
    const page = await browser.newPage()
    
    try {
      console.log(`🔍 Scraping Zara ${category}...`)
      
      // URL de la catégorie (exemple pour homme)
      const url = `${this.config.baseUrl}/fr/fr/${category}/tout-voir-c1706503.html`
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      await this.respectRateLimit()

      // Attendre que les produits se chargent
      await page.waitForSelector('.product-grid-product', { timeout: 10000 })

      // Extraire les liens des produits
      const productLinks = await page.$$eval(
        '.product-grid-product a.product-link',
        (links, baseUrl) => links
          .slice(0, 20) // Prendre plus que nécessaire au cas où certains échouent
          .map(link => (link as HTMLAnchorElement).href)
          .filter(href => href && href.includes('/p/'))
          .map(href => href.startsWith('http') ? href : baseUrl + href),
        this.config.baseUrl
      )

      console.log(`📦 Trouvé ${productLinks.length} produits`)

      const products: ProductData[] = []
      
      for (let i = 0; i < Math.min(productLinks.length, limit); i++) {
        const link = productLinks[i]
        console.log(`   ${i + 1}/${limit} - Scraping ${link}...`)
        
        const product = await this.scrapeProduct(link)
        if (product) {
          products.push(product)
        }
        
        await this.respectRateLimit()
      }

      return products
    } catch (error) {
      console.error('❌ Erreur scraping catégorie:', error)
      return []
    } finally {
      await page.close()
    }
  }

  /**
   * Scrape un produit spécifique
   */
  async scrapeProduct(url: string): Promise<ProductData | null> {
    const browser = await this.initBrowser()
    const page = await browser.newPage()

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

      // Attendre que le contenu se charge
      await page.waitForSelector('.product-detail-info__header-name', { timeout: 10000 })

      // Extraire les données
      const data = await page.evaluate(() => {
        const getName = () => {
          const el = document.querySelector('.product-detail-info__header-name')
          return el?.textContent?.trim() || ''
        }

        const getPrice = () => {
          const el = document.querySelector('.price__amount')
          return el?.textContent?.trim() || ''
        }

        const getImage = () => {
          const img = document.querySelector('.media-image__image') as HTMLImageElement
          return img?.src || img?.getAttribute('data-src') || ''
        }

        const getDescription = () => {
          const el = document.querySelector('.product-detail-info__description')
          return el?.textContent?.trim() || ''
        }

        const getSizes = () => {
          const sizeElements = document.querySelectorAll('.product-size-info__main-label')
          return Array.from(sizeElements).map(el => el.textContent?.trim() || '')
        }

        return {
          name: getName(),
          price: getPrice(),
          imageUrl: getImage(),
          description: getDescription(),
          sizes: getSizes()
        }
      })

      // Normaliser et valider les données
      const product = this.normalizeProductData({
        name: data.name,
        brand: 'Zara',
        price: data.price,
        imageUrl: data.imageUrl,
        productUrl: url,
        sizes: data.sizes.length > 0 ? data.sizes : ['S', 'M', 'L', 'XL'],
        description: data.description,
        category: 'Vêtement'
      })

      if (product) {
        console.log(`      ✅ ${product.name} - ${product.price}`)
      }

      return product
    } catch (error) {
      console.error(`      ❌ Erreur scraping produit ${url}:`, error)
      return null
    } finally {
      await page.close()
    }
  }
}
