# Configuration des Variables d'Environnement pour le Scraper

## Variables Requises

Pour que le scraper fonctionne, tu dois ajouter la `SUPABASE_SERVICE_ROLE_KEY` dans ton fichier `.env.local`.

## Comment obtenir la Service Role Key

1. **Va sur ton dashboard Supabase** : https://supabase.com/dashboard

2. **Sélectionne ton projet** InFit

3. **Va dans Settings** (icône engrenage en bas à gauche)

4. **Clique sur API**

5. **Copie la `service_role` key** (⚠️ PAS la `anon` key !)

6. **Ajoute-la dans `.env.local`** :

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ IMPORTANT - Sécurité

La **service_role key** :
- ✅ Bypass toutes les RLS policies
- ✅ Accès admin complet à la base de données
- ❌ **NE JAMAIS** l'exposer côté client
- ❌ **NE JAMAIS** la commit dans Git
- ✅ Utiliser UNIQUEMENT dans des scripts serveur

Le fichier `.env.local` est déjà dans `.gitignore`, donc il ne sera pas commité.

## Vérification

Une fois ajoutée, teste avec :

```bash
npm run scrape:dry
```

Tu devrais voir :
```
🤖 InFit Auto-Post Scraper
==================================================
Mode: 🔍 DRY RUN (test)
🔧 Initialisation du compte bot...
✅ Compte bot prêt
```

## Fichier .env.local Complet

Ton `.env.local` devrait ressembler à :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### Erreur : "supabaseUrl is required"
→ Vérifie que `NEXT_PUBLIC_SUPABASE_URL` est bien défini

### Erreur : "Variables d'environnement manquantes"
→ Vérifie que `SUPABASE_SERVICE_ROLE_KEY` est bien défini

### Erreur : "Invalid API key"
→ Vérifie que tu as copié la bonne clé (service_role, pas anon)
