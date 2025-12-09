# Guide d'Automatisation du Scraping

## Vue d'ensemble

Ce guide explique comment automatiser le scraping quotidien pour alimenter automatiquement InFit avec de nouveaux produits.

## 📋 Prérequis

1. ✅ Bucket Supabase 'outfits' créé (voir `SUPABASE_STORAGE_SETUP.md`)
2. ✅ Python et dépendances installées
3. ✅ Chrome/Chromium installé
4. ✅ Variables d'environnement configurées

## 🔄 Option 1: Cron Job (Automatique)

### Configuration

```bash
# Éditer crontab
crontab -e

# Ajouter cette ligne pour scraper tous les jours à 9h du matin
0 9 * * * cd /path/to/outfit-share/scripts/scraper/python && ./daily_scrape.sh >> /tmp/infit-scraper.log 2>&1
```

### Exemples de scheduling

```bash
# Tous les jours à 9h
0 9 * * * cd /path/to/outfit-share/scripts/scraper/python && ./daily_scrape.sh

# Deux fois par jour (9h et 18h)
0 9,18 * * * cd /path/to/outfit-share/scripts/scraper/python && ./daily_scrape.sh

# Tous les lundis à 10h
0 10 * * 1 cd /path/to/outfit-share/scripts/scraper/python && ./daily_scrape.sh

# Toutes les 6 heures
0 */6 * * * cd /path/to/outfit-share/scripts/scraper/python && ./daily_scrape.sh
```

### Vérifier les logs

```bash
# Voir les logs
tail -f /tmp/infit-scraper.log

# Voir les dernières exécutions
grep "Daily scraping complete" /tmp/infit-scraper.log
```

## 🖱️ Option 2: Manuel

### Script quotidien

```bash
cd scripts/scraper/python
./daily_scrape.sh
```

### Commande personnalisée

```bash
cd scripts/scraper/python
source venv/bin/activate

# Femmes - nouveautés à -50€
python zalando_selenium.py \
  --category mode-femme \
  --new-arrivals 7 \
  --price-to 50 \
  --order sale \
  --limit 20

# Hommes - nouveautés à -50€
python zalando_selenium.py \
  --category mode-homme \
  --new-arrivals 7 \
  --price-to 50 \
  --order sale \
  --limit 20
```

## 📊 Monitoring

### Vérifier les posts créés

```sql
-- Dans Supabase SQL Editor
SELECT 
  o.id,
  o.created_at,
  p.username,
  o.description
FROM outfits o
JOIN profiles p ON o.user_id = p.id
WHERE p.username = 'InFit_Official'
ORDER BY o.created_at DESC
LIMIT 20;
```

### Statistiques

```sql
-- Nombre de posts par jour
SELECT 
  DATE(created_at) as date,
  COUNT(*) as posts_count
FROM outfits
WHERE user_id = (SELECT id FROM profiles WHERE username = 'InFit_Official')
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🎯 Stratégie Recommandée

### Phase 1: Lancement (Semaine 1)
```bash
# Scraper 50 produits pour démarrer
python zalando_selenium.py --category mode-femme --price-to 50 --order sale --limit 30
python zalando_selenium.py --category mode-homme --price-to 50 --order sale --limit 20
```

### Phase 2: Maintenance (Quotidien)
```bash
# Cron job: 10 nouveaux produits par jour
0 9 * * * cd /path/to/outfit-share/scripts/scraper/python && ./daily_scrape.sh
```

### Phase 3: Croissance (Hebdomadaire)
```bash
# Augmenter progressivement
# Semaine 2: 15 produits/jour
# Semaine 3: 20 produits/jour
# Semaine 4: 30 produits/jour
```

## ⚠️ Bonnes Pratiques

### 1. Rate Limiting
- ✅ Ne pas scraper plus de 50 produits à la fois
- ✅ Attendre 1-2 secondes entre chaque produit
- ✅ Ne pas lancer plusieurs scrapers en parallèle

### 2. Diversité
```bash
# Varier les catégories et filtres
python zalando_selenium.py --category mode-femme --order newest --limit 10
python zalando_selenium.py --category mode-homme --order popularity --limit 10
```

### 3. Qualité
- ✅ Vérifier régulièrement les posts créés
- ✅ Supprimer les doublons si nécessaire
- ✅ Ajuster les filtres selon les résultats

### 4. Légalité
- ⚠️ Respecter les Terms of Service de Zalando
- ⚠️ Ne pas surcharger leurs serveurs
- ✅ Considérer l'API officielle pour usage intensif

## 🔧 Troubleshooting

### Le scraper ne trouve pas de produits
```bash
# Tester avec --show-browser pour voir ce qui se passe
python zalando_selenium.py --show-browser --limit 3 --dry-run
```

### Erreur "Bucket not found"
→ Voir `SUPABASE_STORAGE_SETUP.md`

### Chrome driver error
```bash
# Réinstaller webdriver-manager
pip install --upgrade webdriver-manager
```

### Timeout errors
```bash
# Augmenter le timeout dans zalando_selenium.py
# Ligne: wait = WebDriverWait(self.driver, 20)
# Changer 20 à 30 ou 40
```

## 📈 Métriques de Succès

### Objectifs
- ✅ 10-20 nouveaux posts par jour
- ✅ Taux de succès > 80%
- ✅ Diversité des produits
- ✅ Images de qualité

### Suivi
```bash
# Voir les stats du jour
python -c "
from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import date

load_dotenv('../../../.env.local')
supabase = create_client(os.getenv('NEXT_PUBLIC_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

result = supabase.table('outfits').select('id', count='exact').gte('created_at', str(date.today())).execute()
print(f'Posts créés aujourd\'hui: {result.count}')
"
```

## 🚀 Prochaines Étapes

1. ✅ Créer le bucket Supabase
2. ✅ Tester le scraper en production (2-3 posts)
3. ✅ Vérifier les posts dans l'app
4. ✅ Configurer le cron job
5. ✅ Monitorer pendant 1 semaine
6. ✅ Ajuster selon les résultats
