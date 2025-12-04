# Cognitive Labs - Quiz Fixes Summary

## 🐛 Problèmes corrigés

###  1. Bug du bouton "Recommencer le jeu" ✅
**Problème** : La popup apparaissait et se fermait immédiatement, impossible de voir le contenu.

**Solution** : 
- Remplacement du `window.confirm()` par un composant `AlertDialog` de Radix UI
- Ajout d'un état `showResetDialog` pour contrôler la visibilité
- Dialog avec animation et styled proprement

**Fichiers modifiés** :
- `components/quiz-engine.tsx` : Ajout du AlertDialog avec confirmation

---

### 2. Questions toujours dans le même ordre ✅
**Problème** : Les questions apparaissaient toujours dans le même ordre.

**Solution** :
- Utilisation de la fonction `shuffleArray()` existante dans `lib/data.ts`
- Randomisation des questions ET des options de réponse à chaque début de niveau
- Algorithme Fisher-Yates pour une vraie randomisation

**Fichiers modifiés** :
- `components/quiz-engine.tsx` : Case "START_LEVEL" randomise maintenant les questions

---

### 3. Questions déjà réussies comptées plusieurs fois ✅
**Problème** : En refaisant un niveau, toutes les 20 questions étaient reproposées, permettant de scorer plus de 20/20.

**Solution** :
- Nouveau système de tracking des questions : `answeredQuestions: QuestionAnswer[]`
- Chaque réponse est enregistrée avec `{questionId, isCorrect, answeredAt}`
- Au lancement d'un niveau, seules les questions non répondues ou fausses sont proposées
- Le score n'est incrémenté que si la question n'était pas déjà réussie

**Fichiers modifiés** :
- `lib/storage.ts` : Ajout de l'interface `QuestionAnswer` et du champ `answeredQuestions`
- `app/page.tsx` : Initialisation de `answeredQuestions: []`
- `components/quiz-engine.tsx` : 
  - Filtrage des questions déjà réussies
  - Tracking de toutes les réponses
  - Vérification avant d'incrémenter le score

---

### 4. Sauvegarde des scores dans Supabase ✅
**Problème** : Les scores n'étaient sauvegardés que dans localStorage.

**Solution** :
- Création d'une table `user_scores` dans Supabase
- Fonctions `saveUserScore()` et `loadUserScore()` pour gérer les interactions
- Sauvegarde automatique après chaque réponse
- Upsert basé sur l'email (insert ou update)

**Nouveaux fichiers** :
- `lib/supabase/database.types.ts` : Types TypeScript pour la table
- `lib/supabase/score-manager.ts` : Fonctions de sauvegarde/chargement
- `supabase_migration.sql` : Script SQL pour créer la table

**Fichiers modifiés** :
- `components/quiz-engine.tsx` : Appel à `saveUserScore()` à chaque changement d'état

---

### 5. Amélioration du localStorage ✅
**Problème** : Les données stockées n'étaient pas complètes.

**Solution** :
- Ajout du champ `answeredQuestions` pour tracker toutes les réponses
- Sauvegarde du `totalScore` calculé dynamiquement
- Conservation de `completedQuestionIds` pour rétrocompatibilité

**Fichiers modifiés** :
- `lib/storage.ts` : Interface `QuizState` mise à jour
- `components/quiz-engine.tsx` : Sauvegarde de tous les champs nécessaires

---

## 🗄️ Structure de données Supabase

### Table `user_scores`
```sql
- id: UUID (PK)
- email: TEXT (UNIQUE)
- first_name: TEXT
- last_name: TEXT
- job: TEXT
- total_score: INTEGER
- total_questions: INTEGER
- level_1_score: INTEGER
- level_2_score: INTEGER
- level_3_score: INTEGER
- answered_questions: TEXT[] (IDs des questions réussies)
- unlocked_biases: TEXT[] (IDs des biais débloqués)
- all_levels_completed: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP (auto-update via trigger)
```

---

## 📝 Instructions de déploiement Supabase

1. **Connexion à Supabase** :
   ```bash
   # Vérifiez que vos variables d'environnement sont bien configurées
   # Dans .env.local :
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Créer la table** :
   - Allez dans le dashboard Supabase
   - Section "SQL Editor"
   - Copiez le contenu de `supabase_migration.sql`
   - Exécutez le script

3. **Vérification** :
   - La table `user_scores` devrait être créée
   - Les index et triggers devraient être actifs
   - RLS (Row Level Security) activé

---

## 🧪 Tests à effectuer

1. **Test du bouton Recommencer** :
   - ✅ Cliquer sur "Recommencer le jeu"
   - ✅ Vérifier que le dialog s'affiche correctement
   - ✅ Vérifier qu'on peut annuler
   - ✅ Vérifier que la confirmation reset bien la progression

2. **Test de la randomisation** :
   - ✅ Lancer un niveau plusieurs fois
   - ✅ Vérifier que l'ordre des questions change
   - ✅ Vérifier que l'ordre des options change

3. **Test du scoring** :
   - ✅ Répondre correctement à 5 questions (score = 5/20)
   - ✅ Retourner au menu et relancer le niveau
   - ✅ Vérifier que seules 15 questions sont proposées
   - ✅ Répondre correctement aux 15 restantes
   - ✅ Vérifier que le score total est bien 20/20 (et pas 25/20)

4. **Test Supabase** :
   - ✅ Ouvrir la console du navigateur
   - ✅ Vérifier qu'il n'y a pas d'erreurs de sauvegarde
   - ✅ Aller dans Supabase Dashboard > Table Editor > user_scores
   - ✅ Vérifier que les données sont bien enregistrées
   - ✅ Vérifier que l'upsert fonctionne (pas de doublons)

5. **Test localStorage** :
   - ✅ Ouvrir DevTools > Application > Local Storage
   - ✅ Vérifier la clé `cognitiveBiasQuizState`
   - ✅ Vérifier la présence de `answeredQuestions`
   - ✅ Vérifier que `totalScore` est correct

---

## 🎯 Fonctionnalités ajoutées

- ✅ Dialog de confirmation pour le reset
- ✅ Randomisation des questions et options
- ✅ Tracking précis des réponses (correctes/incorrectes)
- ✅ Filtrage intelligent des questions déjà réussies
- ✅ Sauvegarde automatique dans Supabase
- ✅ Calcul dynamique du score total
- ✅ Protection contre le double comptage des points

---

## 📊 Métriques de performance

- **LocalStorage** : Sauvegarde instantanée
- **Supabase** : Sauvegarde asynchrone (non-bloquante)
- **Randomisation** : O(n) via Fisher-Yates
- **Filtrage** : O(n) via array filter

---

## 🔧 Technologies utilisées

- **Next.js 14** : Framework React
- **TypeScript** : Typage strict
- **Supabase** : Backend & Database
- **Radix UI** : Composants accessibles (AlertDialog)
- **Framer Motion** : Animations
- **Tailwind CSS** : Styling

---

## 🚀 Prochaines améliorations possibles

1. **Authentification** :
   - Ajouter Supabase Auth
   - Lier les scores aux comptes utilisateurs

2. **Leaderboard** :
   - Page de classement global
   - Filtres par niveau
   - Temps de complétion

3. **Analytics** :
   - Questions les plus difficiles
   - Temps moyen par question
   - Taux de réussite par biais

4. **Partage social** :
   - Bouton "Partager mon score"
   - Génération d'images pour les réseaux sociaux

5. **Mode révision** :
   - Revoir uniquement les questions ratées
   - Mode entraînement sans limite

---

## 📞 Support

En cas de problème, vérifiez :
1. Les variables d'environnement Supabase
2. La console du navigateur pour les erreurs
3. Le dashboard Supabase pour les données
4. Le localStorage pour la persistence locale

---

**Version** : 1.0.0  
**Date** : 2025-12-04  
**Auteur** : Cognitive Labs Team
