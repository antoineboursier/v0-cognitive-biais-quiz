# 🎬 Menu Pages de Démo - Documentation

## ✅ Fonctionnalité Ajoutée

**Date** : 2025-12-04  
**Statut** : ✅ Fonctionnel (mode développement uniquement)

---

## 🎯 Objectif

Ajouter un menu de développement dans les paramètres qui permet d'accéder rapidement aux **pages "invisibles"** du site - celles qu'on ne peut normalementpas atteindre facilement en navigation normale.

---

## 📋 Pages Accessibles

### 1. 🏆 **Écran de fin de niveau**
- **État** : `gameState = "levelComplete"`
- **Simulation** : Niveau "Novice" complété avec 18/20
- **Accès rapide** : Cliquez sur "🏆 Écran de fin de niveau"
- **Utilité** : Tester les écrans de fin de quiz sans avoir à compléter un niveau

### 2. 🎓 **Certificat de complétion**
- **État** : `allLevelsCompleted = true`
- **Simulation** : Tous les niveaux complétés à 100% (60/60)
- **Accès rapide** : Cliquez sur "🎓 Certificat de complétion"
- **Utilité** : Tester le certificat sans avoir à terminer tout le jeu

---

## 🔧 Implémentation

### Fichiers Modifiés

#### 1. **`components/settings-menu.tsx`**
- Ajout de l'interface `SettingsMenuProps` avec callback `onDemoPageRequested`
- Ajout de la section "🎬 Pages de Démo" (visible uniquement en dev)
- Deux boutons pour naviguer vers les pages cachées

**Code ajouté** :
```tsx
interface SettingsMenuProps {
  onDemoPageRequested?: (page: 'levelComplete' | 'certificate') => void
}

{/* Demo Pages - ONLY in development */}
{process.env.NODE_ENV === 'development' && onDemoPageRequested && (
  <div className="space-y-3 border-t border-muted/50 pt-4 mt-2">
    <h4 className="text-sm font-semibold text-warning mb-2">🎬 Pages de Démo</h4>
    <Button onClick={() => onDemoPageRequested('levelComplete')}>
      🏆 Écran de fin de niveau
    </Button>
    <Button onClick={() => onDemoPageRequested('certificate')}>
      🎓 Certificat de complétion
    </Button>
  </div>
)}
```

#### 2. **`app/page.tsx`**
- Ajout de la fonction `handleDemoPage` qui navigue vers les pages démomultiples
- Passage du callback au composant `SettingsMenu`

**Code ajouté** :
```tsx
const handleDemoPage = (page: 'levelComplete' | 'certificate') => {
  if (!quizState) return;
  
  if (page === 'levelComplete') {
    const updatedState: QuizState = {
      ...quizState,
      gameState: 'levelComplete',
      currentLevelId: 1,
      levelProgress: {
        ...quizState.levelProgress,
        1: { score: 18, total: 20, completed: true }
      }
    };
    setQuizState(updatedState);
  } else if (page === 'certificate') {
    // Simulate all levels completed
    const allCompletedProgress = LEVELS.reduce((acc, level) => {
      acc[level.id] = { score: 20, total: 20, completed: true };
      return acc;
    }, {});
    
    const updatedState: QuizState = {
      ...quizState,
      allLevelsCompleted: true,
      levelProgress: allCompletedProgress,
      totalScore: 60,
    };
    setQuizState(updatedState);
  }
}

<SettingsMenu onDemoPageRequested={handleDemoPage} />
```

---

## 🎨 Design

### Position dans le Menu
Le menu "Pages de Démo" apparaît **en bas du menu des paramètres**, après :
1. ⚡ Animations
2. 🌙 Thème (Sombre/Clair)
3. 👁️ Mode Triche

### Séparateur Visuel
- Bordure supérieure pour séparer visuellement
- Titre avec emoji 🎬 et couleur "warning" (jaune)
- Description explicative

### Boutons
- Style "outline" pour ne pas surcharger
- Taille "sm" (small)
- Justification à gauche
- Emojis pour identification rapide

---

## 🔒 Sécurité

### Visible Uniquement en Développement
```tsx
{process.env.NODE_ENV === 'development' && onDemoPageRequested && (
  // Menu des pages de démo
)}
```

✅ **En production** : Le menu n'apparaît pas  
✅ **En développement** : Le menu est visible si le callback est fourni

### Données Simulées
Les données utilisées pour les démos sont **temporaires** et ne sont **pas sauvegardées** :
- Elles modifient uniquement le state React local
- Elles ne sont pas persistées dans localStorage
- Un reload ou un reset efface ces données

---

## 📊 États Simulés

### Écran de Fin de Niveau
```tsx
{
  gameState: 'levelComplete',
  currentLevelId: 1,  // Novice
  levelProgress: {
    1: { score: 18, total: 20, completed: true }
  }
}
```
→ Affiche l'écran de fin avec **18/20 (90%)**

### Certificat
```tsx
{
  allLevelsCompleted: true,
  levelProgress: {
    1: { score: 20, total: 20, completed: true },
    2: { score: 20, total: 20, completed: true },
    3: { score: 20, total: 20, completed: true }
  },
  totalScore: 60
}
```
→ Tous les niveaux complétés à 100%

---

## 🎯 Cas d'Usage

### 1. Tester les Designs de Fin de Niveau
**Problème** : Il faut répondre à 20 questions pour voir l'écran de fin  
**Solution** : Clic sur "🏆 Écran de fin de niveau" → accès immédiat

### 2. Tester le Certificat
**Problème** : Il faut terminer les 3 niveaux (60 questions) pour voir le certificat  
**Solution** : Clic sur "🎓 Certificat de complétion" → accès immédiat

### 3. Développement des Écrans de Fin
Pendant le développement des écrans de fin :
- Accès rapide et fréquent
- Tests de différents pourcentages (modifier le score dans le code)
- Validation du design et des animations

### 4. Screenshots et Documentation
- Capture d'écran des différents états finaux
- Documentation des différentes variantes
- Présentation aux stakeholders

---

## 🚀 Comment Utiliser

### Étape 1 : Ouvrir les Paramètres
1. Lancez l'application : `npm run dev`
2. Cliquez sur l'icône **⚙️ Paramètres** (en haut à droite)

### Étape 2 : Accéder aux Pages de Démo
1. Scrollez jusqu'en bas du menu
2. Localisez la section **"🎬 Pages de Démo"**
3. Deux boutons sont disponibles :
   - 🏆 Écran de fin de niveau
   - 🎓 Certificat de complétion

### Étape 3 : Naviguer
- Cliquez sur un bouton pour naviguer vers la page choisie
- Pour revenir : utilisez le bouton "Retour au menu" ou "Recommencer"

---

## ⚠️ Limitations Connues

### 1. Navigation depuis `levelComplete`
Lorsqu'on est déjà sur l'écran `levelComplete` et qu'on clique sur "Certificat", la navigation peut ne pas fonctionner correctement car :
- Le `showCertificate` n'est pas automatiquement activé
- Il faut d'abord revenir au menu principal

**Solution de contournement** : Revenir au menu avant de naviguer vers le certificat

### 2. Pas de Persistance
Les états simulés ne sont pas sauvegardés :
- Un refresh efface l'état simulé
- "Recommencer le jeu" efface l'état simulé

**C'est voulu** : Pour ne pas corrompre les vraies données de l'utilisateur

---

## 🔮 Améliorations Futures Possibles

### 1. Plus de Variations
- Ajouter différents scores (50%, 70%, 100%)
- Différents niveaux de complétion
- État "échec" (< 50%)

### 2. Autres Pages Cachées
- Écran de test Supabase (`/test-supabase`)
- États d'erreur
- Modales fermées

### 3. Mode "Scénario"
- Simuler un parcours utilisateur complet
- Enchainer plusieurs états
- Mode "replay" des actions

### 4. Raccourcis Clavier
- `Ctrl+Shift+D` → Ouvrir le menu démo
- `Ctrl+Shift+1` → Écran de fin
- `Ctrl+Shift+2` → Certificat

---

## ✅ Tests

### Test Manuel
1. ✅ Menu visible en dev
2. ✅ Menu caché en production (`npm run build`)
3. ✅ Navigation vers écran de fin fonctionne
4. ✅ Navigation vers certificat depuis menu fonctionne
5. ⚠️ Navigation certificat depuis `levelComplete` (limitation connue)

### Test de Régression
- ✅ Mode triche fonctionne toujours
- ✅ Paramètres normaux (animations, thème) fonctionnent
- ✅ Navigation normale non affectée

---

## 📝 Retrait de la Fonctionnalité

Quand vous n'en aurez plus besoin :

### Étape 1 : Supprimer la section dans `settings-menu.tsx`
```tsx
// Supprimer les lignes 107-139
{/* Demo Pages - ONLY in development */}
{process.env.NODE_ENV === 'development' && onDemoPageRequested && (
  ...
)}
```

### Étape 2 : Nettoyer l'interface
```tsx
// Supprimer l'interface SettingsMenuProps (lignes 15-17)
// Revenir à la signature simple
export function SettingsMenu() {
```

### Étape 3 : Nettoyer `app/page.tsx`
```tsx
// Supprimer handleDemoPage (lignes 68-105)
// Retirer le prop du SettingsMenu
<SettingsMenu />
```

---

## 📊 Résumé

| Aspect | Détail |
|--------|--------|
| **Pages accessibles** | 2 (fin de niveau, certificat) |
| **Fichiers modifiés** | 2 (`settings-menu.tsx`, `app/page.tsx`) |
| **Mode** | Développement uniquement |
| **Persistance** | Non (temporaire) |
| **Sécurité** | ✅ Caché en production |

---

**Auteur** : Antigravity AI  
**Version** : 1.0  
**Date** : 2025-12-04  
**Statut** : ✅ Opérationnel
