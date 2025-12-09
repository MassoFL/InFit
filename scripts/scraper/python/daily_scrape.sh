#!/bin/bash

# Daily Scraping Script for InFit
# Scrapes new products from Zalando and creates posts automatically

echo "🤖 InFit Daily Scraper"
echo "======================"
date

# Activate virtual environment
source venv/bin/activate

# Scrape women's fashion - new arrivals, max 50€, on sale
echo ""
echo "👗 Scraping women's fashion..."
python zalando_selenium.py \
  --category mode-femme \
  --new-arrivals 1 \
  --price-to 50 \
  --order sale \
  --limit 10

# Wait a bit
sleep 5

# Scrape men's fashion - new arrivals, max 50€, on sale
echo ""
echo "👔 Scraping men's fashion..."
python zalando_selenium.py \
  --category mode-homme \
  --new-arrivals 1 \
  --price-to 50 \
  --order sale \
  --limit 10

echo ""
echo "✅ Daily scraping complete!"
date
