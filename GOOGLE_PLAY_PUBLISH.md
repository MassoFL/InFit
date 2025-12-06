# Guide de Publication Google Play Store

## Prérequis

1. **Compte Google Play Developer** - $25 (paiement unique)
   - Créer un compte sur: https://play.google.com/console/signup

2. **Déployer votre backend** (obligatoire pour production)
   - L'app ne peut pas utiliser localhost en production
   - Options: Vercel, Netlify, Railway, etc.

## Étape 1: Déployer le Backend

### Option A: Vercel (Recommandé - Gratuit)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
cd outfit-share
vercel

# Suivre les instructions
# Votre app sera déployée sur: https://votre-app.vercel.app
```

### Option B: Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Étape 2: Mettre à Jour la Configuration

Une fois déployé, mettez à jour `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.infit.app',
  appName: 'InFit',
  webDir: 'out',
  server: {
    // RETIREZ cette section pour production
    // OU remplacez par votre URL de production:
    // url: 'https://votre-app.vercel.app',
    androidScheme: 'https'
  },
  // ... reste de la config
};
```

## Étape 3: Créer une Clé de Signature

```bash
cd outfit-share/android

# Générer la clé (gardez-la en sécurité!)
keytool -genkey -v -keystore infit-release-key.keystore \
  -alias infit -keyalg RSA -keysize 2048 -validity 10000

# Vous devrez répondre à des questions:
# - Mot de passe (NOTEZ-LE!)
# - Nom, organisation, etc.
```

**⚠️ IMPORTANT:** Sauvegardez cette clé! Si vous la perdez, vous ne pourrez plus mettre à jour votre app!

## Étape 4: Configurer la Signature

Créez `android/key.properties`:

```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=infit
storeFile=infit-release-key.keystore
```

Modifiez `android/app/build.gradle`:

Ajoutez avant `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dans la section `android {`, ajoutez:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

## Étape 5: Mettre à Jour les Infos de l'App

Dans `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.infit.app"  // Votre ID unique
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1      // Incrémenter à chaque mise à jour
        versionName "1.0.0"
    }
}
```

## Étape 6: Créer l'APK/AAB de Production

```bash
cd android
./gradlew bundleRelease

# Le fichier AAB sera créé dans:
# android/app/build/outputs/bundle/release/app-release.aab
```

## Étape 7: Préparer les Assets

### Icône de l'App
- Taille: 512x512 pixels
- Format: PNG (32-bit)
- Pas de transparence

### Feature Graphic
- Taille: 1024x500 pixels
- Format: PNG ou JPEG

### Screenshots
- Minimum 2, maximum 8
- Taille recommandée: 1080x1920 pixels
- Formats: PNG ou JPEG

### Vidéo (optionnel)
- Lien YouTube de démo

## Étape 8: Créer l'App sur Google Play Console

1. Allez sur https://play.google.com/console
2. Cliquez "Create app"
3. Remplissez:
   - **App name:** InFit
   - **Default language:** Français (ou votre langue)
   - **App or game:** App
   - **Free or paid:** Free
   - Acceptez les conditions

## Étape 9: Remplir le Store Listing

### Main Store Listing
- **App name:** InFit
- **Short description:** (80 caractères max)
  "Partagez vos looks et inspirez les autres avec des infos de taille"
  
- **Full description:** (4000 caractères max)
  ```
  InFit est l'app de partage d'outfits qui aide tout le monde à recréer les looks qu'ils aiment.
  
  ✊ Partagez vos tenues avec photos
  📏 Ajoutez votre taille et mensurations
  👕 Listez chaque pièce avec liens d'achat
  ❤️ Likez et sauvegardez vos looks préférés
  
  Fini de se demander "Est-ce que ça m'ira?" - voyez comment les vêtements tombent sur des personnes de votre taille!
  ```

- **App icon:** Votre icône 512x512
- **Feature graphic:** Votre image 1024x500
- **Screenshots:** Minimum 2 captures d'écran
- **Category:** Lifestyle
- **Contact email:** votre@email.com
- **Privacy policy:** URL de votre politique de confidentialité

## Étape 10: Configurer le Contenu

### Content Rating
- Remplissez le questionnaire
- InFit sera probablement classé "Everyone" ou "Teen"

### Target Audience
- Sélectionnez les tranches d'âge appropriées

### Privacy Policy
Vous DEVEZ avoir une politique de confidentialité. Exemple simple:

```
Privacy Policy for InFit

We collect:
- Email address for authentication
- Photos you upload
- Profile information you provide

We use Supabase for data storage and authentication.
We do not sell your data to third parties.

Contact: votre@email.com
```

Hébergez-la sur votre site ou utilisez un service gratuit.

## Étape 11: Upload de l'AAB

1. Dans Google Play Console, allez à **Production**
2. Cliquez **Create new release**
3. Uploadez `app-release.aab`
4. Ajoutez les **Release notes**:
   ```
   Version 1.0.0
   - Première version d'InFit
   - Partagez vos outfits
   - Ajoutez des infos de taille
   - Likez vos looks préférés
   ```
5. Cliquez **Save** puis **Review release**

## Étape 12: Soumettre pour Review

1. Vérifiez que tout est complété (icône verte ✓)
2. Cliquez **Start rollout to Production**
3. Confirmez

## Délai de Review

- **Première soumission:** 1-7 jours (souvent 1-2 jours)
- **Mises à jour:** Quelques heures à 1 jour

## Après Approbation

Votre app sera disponible sur Google Play Store! 🎉

URL: `https://play.google.com/store/apps/details?id=com.infit.app`

## Mises à Jour Futures

Pour mettre à jour l'app:

1. Modifiez le code
2. Incrémentez `versionCode` et `versionName` dans `build.gradle`
3. Recréez l'AAB: `./gradlew bundleRelease`
4. Uploadez sur Google Play Console
5. Soumettez

## Checklist Finale

- [ ] Backend déployé en production
- [ ] Config Capacitor mise à jour
- [ ] Clé de signature créée et sauvegardée
- [ ] AAB généré
- [ ] Icône 512x512 prête
- [ ] Feature graphic 1024x500 prête
- [ ] Screenshots prêts (min 2)
- [ ] Description écrite
- [ ] Politique de confidentialité publiée
- [ ] Compte Google Play Developer créé ($25)
- [ ] Content rating complété
- [ ] AAB uploadé
- [ ] Release soumise

## Coûts

- **Google Play Developer:** $25 (une fois)
- **Hébergement backend:** Gratuit (Vercel/Netlify)
- **Total:** $25

## Ressources

- Google Play Console: https://play.google.com/console
- Documentation: https://developer.android.com/distribute
- Capacitor Docs: https://capacitorjs.com/docs/android
