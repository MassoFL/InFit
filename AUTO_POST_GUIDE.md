# Guide : Auto-Post depuis les Sites Marchands

## Vue d'ensemble

Ce système permet de créer automatiquement des posts InFit à partir des produits des sites marchands de vêtements.

## ⚠️ Considérations Importantes

### Légalité
- **Scraping web** : Vérifier les Terms of Service de chaque site
- **Robots.txt** : Respecter les règles d'accès
- **Rate limiting** : Ne pas surcharger les serveurs
- **Copyright** : Les images appartiennent aux marchands

### Recommandation : APIs Officielles

Au lieu du scraping, utiliser les **APIs d'affiliation** officielles :

#### 1. **ASOS Partner Program**
- API officielle avec accès aux produits
- Commission sur les ventes
- Documentation : https://www.asos.com/partners/

#### 2. **Zalando Partner Program**
- API REST complète
- Flux de produits
- Documentation : https://www.zalando.com/partner-program/

#### 3. **Amazon Product Advertising API**
- Accès à des millions de produits
- Liens d'affiliation
- Documentation : https://webservices.amazon.com/paapi5/documentation/

#### 4. **Shopify Partner API**
- Pour toutes les boutiques Shopify
- Accès aux catalogues
- Documentation : https://shopify.dev/api

## Installation

```bash
# Installer les dépendances
npm install tsx @supabase/supabase-js

# Pour le scraping (optionnel)
npm install puppeteer cheerio sharp

# Pour les APIs (recommandé)
npm install axios
```

## Configuration

### 1. Variables d'environnement

Créer `.env.local` :

```env
# Supabase (requis)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# APIs marchands (optionnel)
ASOS_API_KEY=your_asos_key
ZALANDO_API_KEY=your_zalando_key
AMAZON_API_KEY=your_amazon_key
```

### 2. Compte Bot

Le système crée automatiquement un compte bot :
- **Username** : `InFit_Official`
- **Email** : `bot@infit.app`

Tous les posts automatiques seront créés sous ce compte.

## Utilisation

### Mode Test (Dry Run)

```bash
# Teste sans créer de posts
npm run scrape:dry
```

### Scraping Réel

```bash
# Scrape un marchand spécifique
npm run scrape -- --merchant zara --category men --limit 10

# Scrape avec limite
npm run scrape -- --limit 5

# Scrape une catégorie
npm run scrape -- --category women
```

## Architecture

```
scripts/scraper/
├── config.ts              # Configuration des marchands
├── scrapers/
│   ├── base-scraper.ts   # Classe de base
│   ├── zara-scraper.ts   # Scraper Zara (à implémenter)
│   └── hm-scraper.ts     # Scraper H&M (à implémenter)
├── utils/
│   ├── post-creator.ts   # Création des posts
│   └── image-processor.ts # Traitement images (à implémenter)
└── index.ts              # Point d'entrée
```

## Workflow

1. **Scraping/API** → Récupère les données produits
2. **Téléchargement** → Download les images
3. **Upload** → Upload vers Supabase Storage
4. **Création** → Crée le post avec clothing_pieces
5. **Attribution** → Ajoute le lien vers le marchand

## Exemple : Intégration API ASOS

```typescript
// scripts/scraper/apis/asos-api.ts
import axios from 'axios'

export class AsosAPI {
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async getProducts(category: string, limit: number = 10) {
    const response = await axios.get('https://api.asos.com/products', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      params: {
        category,
        limit
      }
    })
    
    return response.data.products.map(p => ({
      name: p.name,
      brand: p.brand,
      price: p.price.current.text,
      imageUrl: p.imageUrl,
      productUrl: p.url,
      sizes: p.variants.map(v => v.size),
      description: p.description
    }))
  }
}
```

## Prochaines Étapes

### Phase 1 : APIs Officielles (Recommandé)
1. ✅ Structure de base créée
2. ⏳ S'inscrire aux programmes d'affiliation
3. ⏳ Implémenter les clients API
4. ⏳ Tester avec quelques produits
5. ⏳ Automatiser avec cron jobs

### Phase 2 : Scraping (Alternative)
1. ✅ Structure de base créée
2. ⏳ Installer Puppeteer
3. ⏳ Implémenter les scrapers spécifiques
4. ⏳ Ajouter le traitement d'images
5. ⏳ Gérer les erreurs et retries

### Phase 3 : Automatisation
1. ⏳ Créer un cron job (daily/weekly)
2. ⏳ Monitoring et logs
3. ⏳ Dashboard admin
4. ⏳ Modération des posts

## Monétisation

Avec les APIs d'affiliation :
- **Commission** sur chaque vente via les liens
- **Revenus passifs** des posts automatiques
- **Partenariats** avec les marchands

## Support

Pour toute question :
1. Vérifier la documentation des APIs
2. Consulter les exemples dans `/scripts/scraper/`
3. Tester en mode dry-run d'abord
