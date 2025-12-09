# Guide: Zalando Scraper avec BeautifulSoup

## 🚀 Quick Start

### 1. Installation

```bash
cd scripts/scraper/python
./setup.sh
```

Ou manuellement :
```bash
cd scripts/scraper/python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Test avec ton lien exact

```bash
# Activer l'environnement virtuel
source venv/bin/activate

# Scraper avec les mêmes filtres que ton lien
# https://www.zalando.fr/mode-femme/?activation_date=0-7&price_to=50&order=sale
python zalando_scraper.py \
  --category mode-femme \
  --new-arrivals 7 \
  --price-to 50 \
  --order sale \
  --limit 10 \
  --dry-run
```

## 📋 Filtres Disponibles

Tous les filtres de Zalando sont supportés :

| Filtre | Option | Exemple |
|--------|--------|---------|
| Nouveautés | `--new-arrivals X` | `--new-arrivals 7` (7 derniers jours) |
| Prix max | `--price-to X` | `--price-to 50` (max 50€) |
| Prix min | `--price-from X` | `--price-from 20` (min 20€) |
| Tri | `--order TYPE` | `--order sale` (soldes) |
| Marque | `--brand NAME` | `--brand nike` |
| Catégorie | `--category CAT` | `--category mode-femme` |

### Types de tri (`--order`)
- `sale` - Soldes
- `popularity` - Popularité
- `price_asc` - Prix croissant
- `price_desc` - Prix décroissant
- `newest` - Plus récents

## 🎯 Exemples d'Utilisation

### Ton cas d'usage exact
```bash
# Nouveautés femme à -50€ en soldes
python zalando_scraper.py \
  --category mode-femme \
  --new-arrivals 7 \
  --price-to 50 \
  --order sale \
  --limit 10 \
  --dry-run
```

### Autres exemples
```bash
# Produits homme Nike récents
python zalando_scraper.py \
  --category mode-homme \
  --brand nike \
  --new-arrivals 14 \
  --limit 5 \
  --dry-run

# Soldes à moins de 30€
python zalando_scraper.py \
  --price-to 30 \
  --order sale \
  --limit 20 \
  --dry-run

# Nouveautés triées par popularité
python zalando_scraper.py \
  --new-arrivals 7 \
  --order popularity \
  --limit 15 \
  --dry-run
```

## 🔄 Workflow

### 1. Test (Dry Run)
```bash
python zalando_scraper.py --dry-run --limit 5
```
→ Affiche ce qui serait créé sans créer de vrais posts

### 2. Production
```bash
# Enlever --dry-run pour créer de vrais posts
python zalando_scraper.py --limit 5
```
→ Crée les posts dans InFit

## 📊 Ce qui est créé

Pour chaque produit :
- ✅ Post avec image haute qualité
- ✅ Description avec prix
- ✅ Lien d'achat vers Zalando
- ✅ Tailles disponibles
- ✅ Marque et nom du produit
- ✅ Créé par le bot `@InFit_Official`

## ⚙️ Configuration

Le scraper utilise automatiquement `.env.local` à la racine du projet.

Variables requises :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 🤖 Automatisation

Pour automatiser le scraping quotidien, créer un cron job :

```bash
# Éditer crontab
crontab -e

# Ajouter (scrape tous les jours à 9h)
0 9 * * * cd /path/to/outfit-share/scripts/scraper/python && source venv/bin/activate && python zalando_scraper.py --new-arrivals 1 --price-to 50 --order sale --limit 10
```

## ⚠️ Notes Importantes

1. **Rate Limiting** : Le scraper attend 1 seconde entre chaque requête
2. **Légalité** : Vérifier les Terms of Service de Zalando
3. **Alternative** : Considérer l'API officielle Zalando Partner Program
4. **Images** : Les images sont téléchargées et uploadées vers Supabase Storage

## 🐛 Troubleshooting

### "No products found"
→ Zalando a peut-être changé sa structure HTML
→ Vérifier les sélecteurs CSS dans `zalando_scraper.py`

### Erreur d'upload d'image
→ Vérifier que le bucket 'outfits' existe dans Supabase Storage
→ Vérifier les permissions (public read)

### Erreur Supabase
→ Vérifier `.env.local`
→ Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est correcte

## 📈 Prochaines Étapes

1. Tester en dry-run
2. Créer quelques posts réels
3. Vérifier la qualité dans l'app
4. Automatiser avec cron
5. Ajouter d'autres marchands (H&M, Zara, etc.)
