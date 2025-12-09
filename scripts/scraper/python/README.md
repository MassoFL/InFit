# Python Zalando Scraper

Scraper Zalando utilisant BeautifulSoup pour créer automatiquement des posts InFit.

## Installation

```bash
# Créer un environnement virtuel Python
python3 -m venv venv

# Activer l'environnement
source venv/bin/activate  # Sur macOS/Linux
# ou
venv\Scripts\activate  # Sur Windows

# Installer les dépendances
pip install -r requirements.txt
```

## Configuration

Les variables d'environnement sont chargées depuis `.env.local` à la racine du projet.

Requis :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Utilisation

### Mode Test (Dry Run)

```bash
# Scraper 5 produits femme en mode test
python zalando_scraper.py --category mode-femme --limit 5 --dry-run

# Nouveautés des 7 derniers jours, max 50€, triés par soldes
python zalando_scraper.py --category mode-femme --new-arrivals 7 --price-to 50 --order sale --limit 10 --dry-run

# Avec filtre de marque
python zalando_scraper.py --category mode-homme --brand nike --limit 3 --dry-run
```

### Mode Production

```bash
# Créer de vrais posts (attention!)
python zalando_scraper.py --category mode-femme --new-arrivals 7 --price-to 50 --order sale --limit 5

# Scraper catégorie homme
python zalando_scraper.py --category mode-homme --limit 10
```

## Options

### Basiques
- `--category` : Catégorie à scraper (mode-femme, mode-homme, enfant) - défaut: mode-femme
- `--limit` : Nombre de produits à scraper - défaut: 5
- `--dry-run` : Mode test sans créer de posts

### Filtres Zalando
- `--new-arrivals` : Nouveautés des X derniers jours (7, 14, 30)
- `--price-to` : Prix maximum (ex: 50)
- `--price-from` : Prix minimum (ex: 20)
- `--order` : Tri (sale, popularity, price_asc, price_desc, newest)
- `--brand` : Filtrer par marque

## Exemples

```bash
# Nouveautés femme à moins de 50€ en soldes (comme ton lien)
python zalando_scraper.py --category mode-femme --new-arrivals 7 --price-to 50 --order sale --limit 10 --dry-run

# Produits homme entre 20€ et 100€
python zalando_scraper.py --category mode-homme --price-from 20 --price-to 100 --limit 5 --dry-run

# Nouveautés Nike triées par popularité
python zalando_scraper.py --brand nike --new-arrivals 14 --order popularity --limit 8 --dry-run

# Les plus récents à moins de 30€
python zalando_scraper.py --price-to 30 --order newest --limit 15 --dry-run
```

## Raccourcis NPM

Depuis la racine du projet :

```bash
# Mode test
npm run scrape:zalando:dry

# Mode production
npm run scrape:zalando
```

## Notes

- Le scraper respecte un délai de 1 seconde entre chaque requête
- Les images sont téléchargées et uploadées vers Supabase Storage
- Un compte bot `@InFit_Official` est créé automatiquement
- Les posts incluent le lien d'achat vers Zalando

## Troubleshooting

### Erreur: "Missing Supabase credentials"
→ Vérifier que `.env.local` contient les bonnes variables

### Erreur: "No products found"
→ Zalando a peut-être changé sa structure HTML
→ Vérifier les sélecteurs CSS dans le code

### Erreur lors de l'upload d'image
→ Vérifier que le bucket 'outfits' existe dans Supabase Storage
→ Vérifier les permissions du bucket

## Avertissement Légal

⚠️ Ce scraper est fourni à titre éducatif. Vérifier les Terms of Service de Zalando avant utilisation en production. Considérer l'utilisation de l'API officielle Zalando Partner Program pour un usage commercial.
