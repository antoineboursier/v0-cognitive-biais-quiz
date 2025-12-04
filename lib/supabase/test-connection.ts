/**
 * Script de test de la connexion Supabase
 * Exécutez ce fichier dans la console du navigateur pour vérifier :
 * 1. La connexion à Supabase
 * 2. L'existence de la table user_scores
 * 3. Les permissions
 */

import { createClient } from '@/lib/supabase/client';

export async function testSupabaseConnection() {
    console.log('🔍 Test de connexion Supabase...');

    const supabase = createClient();

    // Test 1: Vérifier que le client existe
    console.log('✅ Client Supabase créé');

    // Test 2: Vérifier la table user_scores existe
    console.log('\n📊 Test de la table user_scores...');

    const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Erreur lors de l\'accès à la table:', error);

        if (error.code === '42P01') {
            console.error('\n⚠️ LA TABLE "user_scores" N\'EXISTE PAS !');
            console.log('\n📝 SOLUTION :');
            console.log('1. Allez sur https://supabase.com/dashboard');
            console.log('2. Sélectionnez votre projet');
            console.log('3. Allez dans "SQL Editor"');
            console.log('4. Copiez le contenu de "supabase_migration.sql"');
            console.log('5. Collez et exécutez le script');
        } else if (error.code === 'PGRST301') {
            console.error('\n⚠️ PROBLÈME DE PERMISSIONS (RLS) !');
            console.log('\n📝 SOLUTION :');
            console.log('1. Vérifiez que les policies RLS sont bien configurées');
            console.log('2. Exécutez le script supabase_migration.sql qui configure les permissions');
        } else {
            console.error('\n⚠️ ERREUR INCONNUE:', error.message);
        }

        return { success: false, error };
    }

    console.log('✅ Table user_scores accessible !');
    console.log('📊 Données de test:', data);

    // Test 3: Test d'insertion
    console.log('\n📝 Test d\'insertion...');

    const testData = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        job: 'Tester',
        total_score: 0,
        total_questions: 60,
        level_1_score: 0,
        level_2_score: 0,
        level_3_score: 0,
        answered_questions: [],
        unlocked_biases: [],
        all_levels_completed: false,
    };

    const { data: insertData, error: insertError } = await supabase
        .from('user_scores')
        .upsert(testData, { onConflict: 'email' })
        .select();

    if (insertError) {
        console.error('❌ Erreur lors de l\'insertion:', insertError);
        return { success: false, error: insertError };
    }

    console.log('✅ Test d\'insertion réussi !');
    console.log('📊 Données insérées:', insertData);

    console.log('\n✅ TOUS LES TESTS SONT PASSÉS !');
    console.log('🎉 Supabase est correctement configuré !');

    return { success: true };
}

// Pour l'exécuter, importez et appelez cette fonction dans votre composant
// ou exécutez-la dans la console du navigateur
