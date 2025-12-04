# 🗄️ Guide de création de la table Supabase

## ⚠️ Problème détecté

D'après votre test, la table `user_scores` **n'existe pas** dans votre base de données Supabase.

Erreur : `Could not find the table 'public.user_scores' in the schema cache`

---

## 📝 Solution : Créer la table en 5 étapes

### **Étape 1** : Ouvrir Supabase Dashboard

1. Allez sur : **https://supabase.com/dashboard/project/xrlvfnqnbuwckddrspav**
2. Connectez-vous si nécessaire

---

### **Étape 2** : Accéder au SQL Editor

1. Dans le menu de gauche, cherchez l'icône **⚡ SQL Editor**
2. Cliquez dessus

---

### **Étape 3** : Créer une nouvelle requête

1. Cliquez sur le bouton **"New query"** (en haut à droite)
2. Une nouvelle fenêtre d'éditeur SQL s'ouvre

---

### **Étape 4** : Copier-coller le script SQL

1. Ouvrez le fichier **`supabase_migration.sql`** dans votre projet
   (Il se trouve à la racine : `/Users/ab4a2ccl/Desktop/Cognitive game/v0-cognitive-biais-quiz/supabase_migration.sql`)

2. **Copiez tout le contenu** du fichier (Cmd+A puis Cmd+C)

3. **Collez** dans l'éditeur SQL de Supabase (Cmd+V)

4. Vérifiez que le script commence par :
   ```sql
   -- Create the user_scores table to store quiz progress
   CREATE TABLE IF NOT EXISTS user_scores (
   ```

---

### **Étape 5** : Exécuter le script

1. Cliquez sur le bouton **"Run"** (ou appuyez sur Cmd+Enter / Ctrl+Enter)

2. Vous devriez voir un message vert : **✅ Success. No rows returned**

3. C'est normal ! Cela signifie que la table a été créée avec succès

---

## ✅ Vérification

### Option A : Dans Supabase Dashboard

1. Allez dans **"Table Editor"** (icône de tableau dans le menu gauche)
2. Vous devriez maintenant voir la table **`user_scores`** dans la liste
3. Cliquez dessus pour voir sa structure

### Option B : Dans votre application

1. Retournez sur **http://localhost:3000/test-supabase**
2. Cliquez sur **"Lancer le test"**
3. Vous devriez voir : **✅ TOUS LES TESTS SONT PASSÉS !**

---

## 📊 Structure de la table créée

Voici ce qui sera créé :

```
user_scores
├── id (UUID, PK)
├── email (TEXT, UNIQUE) ← Clé pour identifier l'utilisateur
├── first_name (TEXT)
├── last_name (TEXT)
├── job (TEXT)
├── total_score (INTEGER)
├── total_questions (INTEGER)
├── level_1_score (INTEGER)
├── level_2_score (INTEGER)
├── level_3_score (INTEGER)
├── answered_questions (TEXT[]) ← Questions réussies
├── unlocked_biases (TEXT[]) ← Biais débloqués
├── all_levels_completed (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP) ← Mis à jour automatiquement
```

---

## 🔒 Sécurité (RLS)

Le script active automatiquement Row Level Security et crée une politique qui permet :
- ✅ SELECT (lecture)
- ✅ INSERT (création)
- ✅ UPDATE (mise à jour)
- ✅ DELETE (suppression)

**Note** : Dans une vraie application en production, vous devriez restreindre ces permissions. Pour ce quiz, c'est OK car il n'y a pas de données sensibles.

---

## 🚨 En cas de problème

### Erreur : "permission denied for table user_scores"
➡️ Le script RLS n'a pas été exécuté. Réexécutez tout le script `supabase_migration.sql`.

### Erreur : "relation user_scores already exists"
➡️ La table existe déjà ! Vérifiez dans Table Editor. Si elle est vide/incorrecte, supprimez-la d'abord :
```sql
DROP TABLE IF EXISTS user_scores CASCADE;
```
Puis réexécutez le script complet.

### La table apparaît vide après exécution
➡️ C'est normal ! Les données seront ajoutées quand vous jouerez au quiz.

---

## 🎯 Après la création

Une fois la table créée :

1. ✅ Rafraîchissez votre application (Cmd+R)
2. ✅ Jouez au quiz
3. ✅ Vos scores seront automatiquement sauvegardés dans Supabase
4. ✅ Vous pouvez les voir dans Table Editor > user_scores

---

**Besoin d'aide ?** Copiez l'erreur exacte que vous voyez et je vous aiderai à la résoudre ! 🚀
