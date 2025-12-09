# Configuration des Reposts

## 1. Créer la table dans Supabase

Exécute le fichier SQL `supabase/add_reposts.sql` dans l'éditeur SQL de Supabase.

## 2. Fonctionnalités

- **Bouton de repost** : Icône de partage à côté des likes et saves
- **Compteur de reposts** : Affiche le nombre de fois qu'un post a été republié
- **Attribution** : Quand un post est republié, il affiche "Republié par @username" et montre le créateur original
- **Feed** : Les reposts apparaissent dans le feed comme des posts normaux

## 3. Logique

- Un utilisateur peut republier un post une seule fois (contrainte UNIQUE)
- Les reposts sont visibles par tout le monde
- Seul l'utilisateur peut supprimer son propre repost
- Le post original garde son créateur, mais affiche qui l'a republié

## 4. UI

- Icône de repost (flèches de partage) en blanc
- Remplie quand l'utilisateur a republié
- Compteur en dessous
- Mention "Republié par @username" au-dessus du nom du créateur original
