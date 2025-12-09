#!/usr/bin/env python3
"""
Zalando Scraper using Selenium (real browser)
More reliable than requests but slower
"""

import os
import sys
import time
from pathlib import Path
from typing import List, Dict, Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from project root
project_root = Path(__file__).parent.parent.parent.parent
env_path = project_root / '.env.local'
load_dotenv(env_path)


class ZalandoSeleniumScraper:
    def __init__(self, headless: bool = True):
        """Initialize Selenium scraper"""
        self.base_url = "https://www.zalando.fr"
        self.headless = headless
        self.driver = None
        
        # Initialize Supabase
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials in .env.local")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.bot_user_id = None
    
    def init_driver(self):
        """Initialize Chrome driver"""
        if self.driver:
            return
        
        print("🌐 Initializing Chrome driver...")
        
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument('--headless=new')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Disable automation flags
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Remove webdriver property
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        print("✅ Chrome driver ready")
    
    def close_driver(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.driver = None
            print("🔒 Browser closed")
    
    def init_bot_user(self) -> str:
        """Initialize or get the bot user"""
        print("🔧 Initializing bot user...")
        
        result = self.supabase.table('profiles').select('id').eq('username', 'InFit_Official').execute()
        
        if result.data:
            self.bot_user_id = result.data[0]['id']
            print(f"✅ Bot user found: {self.bot_user_id}")
            return self.bot_user_id
        
        auth_result = self.supabase.auth.admin.create_user({
            'email': 'bot@infit.app',
            'email_confirm': True,
            'user_metadata': {'username': 'InFit_Official'}
        })
        
        user_id = auth_result.user.id
        
        self.supabase.table('profiles').insert({
            'id': user_id,
            'username': 'InFit_Official',
            'height': 180
        }).execute()
        
        self.bot_user_id = user_id
        print(f"✅ Bot user created: {self.bot_user_id}")
        return user_id
    
    def scrape_category(self, category: str = "mode-femme", filters: Dict = None, limit: int = 10) -> List[Dict]:
        """Scrape products using Selenium"""
        self.init_driver()
        
        print(f"\n🛍️  Scraping Zalando - Category: {category}")
        
        # Build URL
        url = f"{self.base_url}/{category}/"
        if filters:
            params = []
            if 'activation_date' in filters:
                params.append(f"activation_date={filters['activation_date']}")
            if 'price_to' in filters:
                params.append(f"price_to={filters['price_to']}")
            if 'order' in filters:
                params.append(f"order={filters['order']}")
            if params:
                url += "?" + "&".join(params)
        
        print(f"📍 URL: {url}")
        
        try:
            # Load page
            print("⏳ Loading page...")
            self.driver.get(url)
            
            # Wait for products to load
            print("⏳ Waiting for products...")
            wait = WebDriverWait(self.driver, 20)
            
            # Try multiple selectors
            try:
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'article[data-testid="product-card"]')))
                selector = 'article[data-testid="product-card"]'
            except:
                try:
                    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.cat_articleCard')))
                    selector = '.cat_articleCard'
                except:
                    selector = 'article'
            
            # Scroll to load more products
            print("📜 Scrolling to load products...")
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
            
            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'lxml')
            product_cards = soup.select(selector)[:limit * 2]
            
            print(f"📦 Found {len(product_cards)} product cards")
            
            products = []
            for i, card in enumerate(product_cards[:limit]):
                print(f"   {i+1}/{limit} - Extracting product data...")
                product = self._extract_product_data(card)
                
                if product:
                    products.append(product)
                    print(f"      ✅ {product['name']} - {product['price']}")
                
                time.sleep(1)
            
            return products
            
        except Exception as e:
            print(f"❌ Error scraping: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def _extract_product_data(self, card) -> Optional[Dict]:
        """Extract product data from card"""
        try:
            # Extract link
            link = card.find('a', href=True)
            if not link:
                return None
            product_url = link['href']
            if not product_url.startswith('http'):
                product_url = self.base_url + product_url
            
            # Extract image
            img = card.find('img')
            image_url = img.get('src') or img.get('data-src') if img else None
            if not image_url:
                return None
            
            # Clean image URL
            if '?' in image_url:
                image_url = image_url.split('?')[0]
            
            # Extract name
            name_elem = card.find('h3') or card.find('div', class_='cat_articleName')
            name = name_elem.get_text(strip=True) if name_elem else "Product"
            
            # Extract brand
            brand_elem = card.find('div', class_='cat_brandName') or card.find('h2')
            brand = brand_elem.get_text(strip=True) if brand_elem else "Zalando"
            
            # Extract price
            price_elem = card.find('p', class_='cat_price') or card.find('span', {'data-testid': 'price'})
            price = price_elem.get_text(strip=True) if price_elem else "N/A"
            
            return {
                'name': name,
                'brand': brand,
                'price': price,
                'image_url': image_url,
                'product_url': product_url,
                'sizes': ['S', 'M', 'L', 'XL'],
                'description': f"{brand} - {name}",
                'category': 'Vêtement'
            }
            
        except Exception as e:
            print(f"      ⚠️  Error extracting: {e}")
            return None
    
    def upload_image(self, image_url: str, product_name: str) -> Optional[str]:
        """Download and upload image"""
        try:
            import requests
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            filename = f"scraped/{int(time.time())}-{product_name.replace(' ', '-').lower()[:50]}.jpg"
            
            self.supabase.storage.from_('outfits').upload(
                filename,
                response.content,
                {'content-type': 'image/jpeg'}
            )
            
            public_url = self.supabase.storage.from_('outfits').get_public_url(filename)
            return public_url
            
        except Exception as e:
            print(f"      ❌ Error uploading image: {e}")
            return None
    
    def create_post(self, product: Dict, dry_run: bool = False) -> Optional[str]:
        """Create a post"""
        try:
            if dry_run:
                print(f"   🔍 [DRY RUN] Would create: {product['brand']} - {product['name']} - {product['price']}")
                return None
            
            print(f"   📸 Uploading image...")
            image_url = self.upload_image(product['image_url'], product['name'])
            if not image_url:
                return None
            
            print(f"   📝 Creating post...")
            outfit_result = self.supabase.table('outfits').insert({
                'user_id': self.bot_user_id,
                'image_url': image_url,
                'publisher_height': 180,
                'publisher_size': 'M',
                'description': f"{product['name']} - {product['price']}\n\n{product['description']}"
            }).execute()
            
            if not outfit_result.data:
                return None
            
            outfit_id = outfit_result.data[0]['id']
            
            clothing_pieces = [{
                'outfit_id': outfit_id,
                'brand': product['brand'],
                'product_name': product['name'],
                'size': size,
                'category': product['category'],
                'description': product['description'],
                'purchase_link': product['product_url']
            } for size in product['sizes']]
            
            self.supabase.table('clothing_pieces').insert(clothing_pieces).execute()
            
            print(f"   ✅ Post created: {outfit_id}")
            return outfit_id
            
        except Exception as e:
            print(f"   ❌ Error creating post: {e}")
            return None
    
    def create_posts(self, products: List[Dict], dry_run: bool = False):
        """Create multiple posts"""
        print(f"\n🚀 Creating {len(products)} posts...")
        
        success = 0
        errors = 0
        
        for product in products:
            result = self.create_post(product, dry_run)
            if result or dry_run:
                success += 1
            else:
                errors += 1
            time.sleep(1)
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Success: {success}")
        print(f"   ❌ Errors: {errors}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Zalando Selenium Scraper')
    parser.add_argument('--category', default='mode-femme', help='Category')
    parser.add_argument('--limit', type=int, default=5, help='Number of products')
    parser.add_argument('--dry-run', action='store_true', help='Test mode')
    parser.add_argument('--show-browser', action='store_true', help='Show browser window')
    parser.add_argument('--new-arrivals', type=int, help='New arrivals (days)')
    parser.add_argument('--price-to', type=int, help='Max price')
    parser.add_argument('--order', help='Sort order')
    
    args = parser.parse_args()
    
    print("🤖 InFit Zalando Selenium Scraper")
    print("=" * 50)
    print(f"Mode: {'🔍 DRY RUN' if args.dry_run else '🚀 PRODUCTION'}")
    print(f"Browser: {'👁️  Visible' if args.show_browser else '🕶️  Headless'}")
    print(f"Category: {args.category}")
    print(f"Limit: {args.limit}")
    print("=" * 50)
    
    try:
        scraper = ZalandoSeleniumScraper(headless=not args.show_browser)
        scraper.init_bot_user()
        
        filters = {}
        if args.new_arrivals:
            filters['activation_date'] = f"0-{args.new_arrivals}"
        if args.price_to:
            filters['price_to'] = args.price_to
        if args.order:
            filters['order'] = args.order
        
        products = scraper.scrape_category(args.category, filters, args.limit)
        
        if products:
            scraper.create_posts(products, args.dry_run)
        else:
            print("\n⚠️  No products found")
        
        scraper.close_driver()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
