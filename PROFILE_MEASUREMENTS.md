# Espace Personnel - Informations Utilisateur

## Nouvelle Fonctionnalité

L'application dispose maintenant d'un espace personnel où les utilisateurs peuvent enregistrer leur taille et leur poids. Ces informations permettront :

1. **Recommandations personnalisées** - Proposer des articles adaptés à la morphologie
2. **Aide à la communauté** - Aider les autres utilisateurs à comprendre comment les vêtements leur iront
3. **Filtrage intelligent** - Trouver des outfits de personnes avec une morphologie similaire

## Installation

### 1. Mettre à jour la base de données

Exécutez le script SQL pour ajouter les colonnes :

```sql
-- Dans le SQL Editor de Supabase, exécutez :
ALTER TABLE public.profiles
ADD COLUMN height INTEGER, -- in cm
ADD COLUMN weight INTEGER; -- in kg
```

Ou utilisez le fichier : `supabase/add_body_measurements.sql`

### 2. Accéder à la page profil

Une fois connecté, cliquez sur "Mon Profil" dans la navigation ou allez sur `/profile`

## Informations Disponibles

- **Taille** (cm) - Hauteur en centimètres
- **Poids** (kg) - Poids en kilogrammes

## Utilisation

1. Cliquez sur "Modifier" pour activer le mode édition
2. Remplissez votre taille et votre poids
3. Cliquez sur "Enregistrer" pour sauvegarder
4. Cliquez sur "Annuler" pour abandonner les modifications

## Prochaines Étapes

Ces informations pourront être utilisées pour :
- Filtrer les outfits par morphologie similaire
- Recommander des tailles de vêtements
- Créer un système de matching entre utilisateurs
- Générer des suggestions d'articles personnalisées
- Afficher la taille/poids du créateur sur chaque outfit
