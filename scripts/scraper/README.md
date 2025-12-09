# Auto-Post Scraper pour InFit

Ce module permet de scraper automatiquement les sites de marchands de vêtements et créer des posts sur l'application.

## Architecture

```
scripts/scraper/
├── README.md                 # Ce fichier
├── config.ts                 # Configuration des marchands
├── scrapers/
│   ├── base-scraper.ts      # Classe de base pour tous les scrapers
│   ├── zara-scraper.ts      # Scraper pour Zara
│   ├── hm-scraper.ts        # Scraper pour H&M
│   └── asos-scraper.ts      # Scraper pour ASOS
├── utils/
│   ├── image-processor.ts   # Traitement et upload des images
│   └── post-creator.ts      # Création des posts dans Supabase
└── index.ts                  # Point d'entrée principal
```

## Fonctionnalités

1. **Scraping intelligent** - Extraction des infos produits (images, prix, tailles, descriptions)
2. **Traitement d'images** - Téléchargement et upload vers Supabase Storage
3. **Création automatique de posts** - Génération de posts avec toutes les infos
4. **Support multi-marchands** - Architecture extensible pour ajouter de nouveaux sites
5. **Rate limiting** - Respect des limites des sites web
6. **Error handling** - Gestion robuste des erreurs

## Technologies

- **Puppeteer** ou **Playwright** - Pour le scraping dynamique
- **Cheerio** - Pour le parsing HTML
- **Sharp** - Pour le traitement d'images
- **Supabase Client** - Pour l'insertion en base de données

## Installation

```bash
npm install puppeteer cheerio sharp @supabase/supabase-js
# ou
npm install playwright cheerio sharp @supabase/supabase-js
```

## Configuration

Créer un fichier `.env.local` avec :

```env
SCRAPER_USER_AGENT="Mozilla/5.0..."
SCRAPER_DELAY_MS=2000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Utilisation

```bash
# Scraper un marchand spécifique
npm run scrape -- --merchant zara --category men

# Scraper tous les marchands
npm run scrape:all

# Mode test (sans créer de posts)
npm run scrape -- --dry-run
```

## Considérations légales

⚠️ **IMPORTANT** : 
- Vérifier les Terms of Service de chaque site
- Respecter le robots.txt
- Implémenter un rate limiting approprié
- Considérer l'utilisation d'APIs officielles quand disponibles
- Ajouter une attribution claire aux marchands

## Alternative : APIs officielles

Plusieurs marchands offrent des APIs d'affiliation :
- **ASOS** - API Partner Program
- **Zalando** - Partner Program API
- **Amazon** - Product Advertising API
- **Shopify** - Pour les boutiques Shopify

Ces APIs sont préférables au scraping car elles sont légales et stables.
