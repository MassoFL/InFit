#!/bin/bash

echo "🐍 Setting up Python Zalando Scraper..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3: https://www.python.org/downloads/"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To use the scraper:"
echo "  1. Activate the virtual environment:"
echo "     source venv/bin/activate"
echo ""
echo "  2. Run the scraper:"
echo "     python zalando_scraper.py --dry-run --limit 5"
echo ""
echo "  3. With filters (like your link):"
echo "     python zalando_scraper.py --category mode-femme --new-arrivals 7 --price-to 50 --order sale --limit 10 --dry-run"
