# Configuration Supabase Storage

## Problème

Le scraper ne peut pas uploader les images car le bucket 'outfits' n'existe pas.

```
Error: Bucket not found
```

## Solution : Créer le Bucket

### 1. Aller sur Supabase Dashboard

https://supabase.com/dashboard

### 2. Sélectionner ton projet InFit

### 3. Aller dans Storage (icône dossier dans le menu gauche)

### 4. Créer un nouveau bucket

- Cliquer sur "New bucket"
- **Name**: `outfits`
- **Public bucket**: ✅ COCHER (important pour que les images soient accessibles)
- Cliquer sur "Create bucket"

### 5. Configurer les permissions (RLS)

Une fois le bucket créé, aller dans "Policies" et ajouter :

#### Policy 1: Public Read
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'outfits');
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'outfits' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Service Role Full Access
```sql
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
USING (bucket_id = 'outfits');
```

### 6. Tester

Une fois le bucket créé, relancer le scraper :

```bash
cd scripts/scraper/python
source venv/bin/activate
python zalando_selenium.py --category mode-femme --new-arrivals 7 --price-to 50 --order sale --limit 2
```

## Alternative : Créer via SQL

Tu peux aussi créer le bucket via SQL dans l'éditeur SQL de Supabase :

```sql
-- Créer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('outfits', 'outfits', true);

-- Ajouter les policies
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'outfits');

CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
USING (bucket_id = 'outfits');
```

## Vérification

Le bucket devrait apparaître dans Storage > outfits avec :
- ✅ Public access enabled
- ✅ Policies configured
- 📁 Dossier 'scraped' sera créé automatiquement lors du premier upload
