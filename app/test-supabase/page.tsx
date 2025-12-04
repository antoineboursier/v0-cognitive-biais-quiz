"use client"

import { useState } from 'react';
import { testSupabaseConnection } from '@/lib/supabase/test-connection';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestSupabasePage() {
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const runTest = async () => {
        setIsLoading(true);
        setResult('Test en cours...\n');

        // Rediriger console.log vers notre interface
        const originalLog = console.log;
        const originalError = console.error;
        const logs: string[] = [];

        console.log = (...args) => {
            logs.push(args.join(' '));
            originalLog(...args);
        };

        console.error = (...args) => {
            logs.push('❌ ' + args.join(' '));
            originalError(...args);
        };

        try {
            await testSupabaseConnection();
        } catch (error) {
            logs.push(`\n❌ Erreur fatale: ${error}`);
        }

        // Restaurer console
        console.log = originalLog;
        console.error = originalError;

        setResult(logs.join('\n'));
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-cyan-400">
                    🔧 Test de connexion Supabase
                </h1>

                <Card className="p-6 bg-gray-900/50 border-gray-800 mb-6">
                    <p className="text-gray-400 mb-4">
                        Cette page vous permet de tester la connexion à Supabase et de vérifier que tout est correctement configuré.
                    </p>

                    <Button
                        onClick={runTest}
                        disabled={isLoading}
                        className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                    >
                        {isLoading ? 'Test en cours...' : 'Lancer le test'}
                    </Button>
                </Card>

                {result && (
                    <Card className="p-6 bg-gray-900/50 border-gray-800">
                        <h2 className="text-xl font-bold mb-4 text-white">Résultats :</h2>
                        <pre className="bg-black/50 p-4 rounded overflow-auto text-sm text-gray-300 whitespace-pre-wrap">
                            {result}
                        </pre>
                    </Card>
                )}

                <Card className="p-6 bg-gray-900/50 border-gray-800 mt-6">
                    <h2 className="text-xl font-bold mb-4 text-yellow-400">
                        📝 Comment créer la table user_scores
                    </h2>

                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
                        <p className="text-red-400 font-bold">
                            ⚠️ LA TABLE "user_scores" N'EXISTE PAS DANS VOTRE BASE DE DONNÉES !
                        </p>
                        <p className="text-gray-300 mt-2">
                            Suivez les étapes ci-dessous pour la créer.
                        </p>
                    </div>

                    <ol className="list-decimal list-inside space-y-3 text-gray-300">
                        <li>
                            <strong className="text-white">Ouvrez le SQL Editor de Supabase</strong>
                            <br />
                            <a
                                href="https://supabase.com/dashboard/project/xrlvfnqnbuwckddrspav/sql/new"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 underline hover:text-cyan-300 ml-6"
                            >
                                → Cliquez ici pour ouvrir directement le SQL Editor
                            </a>
                        </li>

                        <li>
                            <strong className="text-white">Copiez le script SQL</strong>
                            <br />
                            <span className="ml-6 text-sm">
                                Ouvrez le fichier <code className="bg-black/50 px-2 py-1 rounded">supabase_migration.sql</code> dans votre projet
                            </span>
                        </li>

                        <li>
                            <strong className="text-white">Collez et exécutez</strong>
                            <br />
                            <span className="ml-6 text-sm">
                                Collez le script dans l'éditeur SQL et cliquez sur <strong>"Run"</strong> (ou Cmd+Enter)
                            </span>
                        </li>

                        <li>
                            <strong className="text-white">Vérifiez</strong>
                            <br />
                            <span className="ml-6 text-sm">
                                Vous devriez voir : <span className="text-green-400">✅ Success. No rows returned</span>
                            </span>
                        </li>

                        <li>
                            <strong className="text-white">Retestez</strong>
                            <br />
                            <span className="ml-6 text-sm">
                                Revenez ici et cliquez à nouveau sur "Lancer le test"
                            </span>
                        </li>
                    </ol>

                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded">
                        <p className="text-blue-300 text-sm">
                            💡 <strong>Astuce</strong> : Le guide complet est disponible dans le fichier <code className="bg-black/50 px-2 py-1 rounded">GUIDE_SUPABASE.md</code>
                        </p>
                    </div>
                </Card>

                <div className="mt-6 text-center">
                    <a
                        href="/"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                        ← Retour à l'application
                    </a>
                </div>
            </div>
        </div>
    );
}
