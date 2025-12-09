#!/usr/bin/env python3
"""
Zalando Scraper using BeautifulSoup
Scrapes product data from Zalando and creates posts in InFit
"""

import os
import sys
import time
import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from urllib.parse import urljoin

# Load environment variables
load_dotenv('.env.local')

class ZalandoScraper:
    def __init__(self):
        self.base_url = "https://www.zalando.fr"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        # Initialize Supabase
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials in .env.local")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.bot_user_id = None
    
    def init_bot_user(self) -> str:
        """Initialize or get the bot user"""
        print("🔧 Initializing bot user...")
        
        # Check if bot exists
        result = self.supabase.table('profiles').select('id').eq('username', 'InFit_Official').execute()
        
        if result.data:
            self.bot_user_id = result.data[0]['id']
            print(f"✅ Bot user found: {self.bot_user_id}")
            return self.bot_user_id
        
        # Create bot user
        auth_result = self.supabase.auth.admin.create_user({
            'email': 'bot@infit.app',
            'email_confirm': True,
            'user_metadata': {
                'username': 'InFit_Official'
            }
        })
        
        user_id = auth_result.user.id
        
        # Create profile
        self.supabase.table('profiles').insert({
            'id': user_id,
            'username': 'InFit_Official',
            'height': 180
        }).execute()
        
        self.bot_user_id = user_id
        print(f"✅ Bot user created: {self.bot_user_id}")
        return user_id
    
    def scrape_category(self, category: str = "homme", filters: Dict = None, limit: int = 10) -> List[Dict]:
        """
        Scrape products from a Zalando category
        
        Args:
            category: Category to scrape (homme, femme, enfant, mode-femme, mode-homme)
            filters: Optional filters (activation_date, price_to, order, brand, etc.)
            limit: Maximum number of products to scrape
        """
        print(f"\n🛍️  Scraping Zalando - Category: {category}")
        
        # Build URL with filters
        url = f"{self.base_url}/{category}/"
        
        if filters:
            # Add filters to URL
            params = []
            
            # New arrivals filter (0-7 days, 0-14 days, etc.)
            if 'activation_date' in filters:
                params.append(f"activation_date={filters['activation_date']}")
            
            # Price filters
            if 'price_from' in filters:
                params.append(f"price_from={filters['price_from']}")
            if 'price_to' in filters:
                params.append(f"price_to={filters['price_to']}")
            
            # Sort order (sale, popularity, price_asc, price_desc, newest)
            if 'order' in filters:
                params.append(f"order={filters['order']}")
            
            # Brand filter
            if 'brand' in filters:
                params.append(f"brand={filters['brand']}")
            
            if params:
                url += "?" + "&".join(params)
        
        print(f"📍 URL: {url}")
        
        if filters:
            print(f"🔍 Filters applied:")
            for key, value in filters.items():
                print(f"   - {key}: {value}")
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Find product cards (Zalando uses data-testid attributes)
            product_cards = soup.find_all('article', {'data-testid': 'product-card'}, limit=limit * 2)
            
            if not product_cards:
                # Try alternative selectors
                product_cards = soup.find_all('div', class_='cat_articleCard', limit=limit * 2)
            
            print(f"📦 Found {len(product_cards)} product cards")
            
            products = []
            for i, card in enumerate(product_cards[:limit]):
                print(f"   {i+1}/{limit} - Extracting product data...")
                product = self._extract_product_data(card)
                
                if product:
                    products.append(product)
                    print(f"      ✅ {product['name']} - {product['price']}")
                
                # Rate limiting
                time.sleep(1)
            
            return products
            
        except Exception as e:
            print(f"❌ Error scraping category: {e}")
            return []
    
    def _extract_product_data(self, card) -> Optional[Dict]:
        """Extract product data from a product card"""
        try:
            # Extract product link
            link_elem = card.find('a', href=True)
            if not link_elem:
                return None
            
            product_url = urljoin(self.base_url, link_elem['href'])
            
            # Extract image
            img_elem = card.find('img')
            image_url = img_elem.get('src') or img_elem.get('data-src') if img_elem else None
            
            if not image_url:
                return None
            
            # Extract name
            name_elem = card.find('h3') or card.find('div', class_='cat_articleName')
            name = name_elem.get_text(strip=True) if name_elem else "Product"
            
            # Extract brand
            brand_elem = card.find('div', class_='cat_brandName') or card.find('h2')
            brand = brand_elem.get_text(strip=True) if brand_elem else "Zalando"
            
            # Extract price
            price_elem = card.find('p', class_='cat_price') or card.find('span', {'data-testid': 'price'})
            price = price_elem.get_text(strip=True) if price_elem else "N/A"
            
            # Clean image URL (remove size parameters to get high quality)
            if image_url and 'zalando' in image_url:
                image_url = image_url.split('?')[0]
            
            return {
                'name': name,
                'brand': brand,
                'price': price,
                'image_url': image_url,
                'product_url': product_url,
                'sizes': ['S', 'M', 'L', 'XL'],  # Default sizes
                'description': f"{brand} - {name}",
                'category': 'Vêtement'
            }
            
        except Exception as e:
            print(f"      ⚠️  Error extracting product: {e}")
            return None
    
    def upload_image(self, image_url: str, product_name: str) -> Optional[str]:
        """Download and upload image to Supabase Storage"""
        try:
            # Download image
            response = self.session.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Generate filename
            filename = f"scraped/{int(time.time())}-{product_name.replace(' ', '-').lower()[:50]}.jpg"
            
            # Upload to Supabase
            result = self.supabase.storage.from_('outfits').upload(
                filename,
                response.content,
                {'content-type': 'image/jpeg'}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_('outfits').get_public_url(filename)
            
            return public_url
            
        except Exception as e:
            print(f"      ❌ Error uploading image: {e}")
            return None
    
    def create_post(self, product: Dict, dry_run: bool = False) -> Optional[str]:
        """Create a post from product data"""
        try:
            if dry_run:
                print(f"   🔍 [DRY RUN] Would create post: {product['brand']} - {product['name']}")
                return None
            
            # Upload image
            print(f"   📸 Uploading image...")
            image_url = self.upload_image(product['image_url'], product['name'])
            
            if not image_url:
                return None
            
            # Create outfit post
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
            
            # Add clothing pieces
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
            
            time.sleep(1)  # Rate limiting
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Success: {success}")
        print(f"   ❌ Errors: {errors}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Zalando Scraper for InFit')
    parser.add_argument('--category', default='mode-femme', help='Category to scrape (mode-femme, mode-homme, enfant)')
    parser.add_argument('--brand', help='Filter by brand')
    parser.add_argument('--limit', type=int, default=5, help='Number of products to scrape')
    parser.add_argument('--dry-run', action='store_true', help='Test mode without creating posts')
    
    # Zalando specific filters
    parser.add_argument('--new-arrivals', type=int, help='New arrivals in last X days (e.g., 7, 14, 30)')
    parser.add_argument('--price-to', type=int, help='Maximum price (e.g., 50)')
    parser.add_argument('--price-from', type=int, help='Minimum price')
    parser.add_argument('--order', choices=['sale', 'popularity', 'price_asc', 'price_desc', 'newest'], 
                        help='Sort order')
    
    args = parser.parse_args()
    
    print("🤖 InFit Zalando Scraper")
    print("=" * 50)
    print(f"Mode: {'🔍 DRY RUN' if args.dry_run else '🚀 PRODUCTION'}")
    print(f"Category: {args.category}")
    print(f"Limit: {args.limit}")
    print("=" * 50)
    
    try:
        scraper = ZalandoScraper()
        scraper.init_bot_user()
        
        # Build filters
        filters = {}
        
        if args.brand:
            filters['brand'] = args.brand
        
        if args.new_arrivals:
            filters['activation_date'] = f"0-{args.new_arrivals}"
        
        if args.price_to:
            filters['price_to'] = args.price_to
        
        if args.price_from:
            filters['price_from'] = args.price_from
        
        if args.order:
            filters['order'] = args.order
        
        products = scraper.scrape_category(args.category, filters, args.limit)
        
        if products:
            scraper.create_posts(products, args.dry_run)
        else:
            print("\n⚠️  No products found")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
