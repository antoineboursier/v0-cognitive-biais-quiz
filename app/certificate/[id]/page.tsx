import { notFound } from 'next/navigation'
import { ArrowLeft, Brain, Award, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
    params: {
        id: string
    }
    searchParams: {
        data?: string
    }
}

export default function CertificatePage({ params, searchParams }: PageProps) {
    const dataParam = searchParams.data

    let certificateData = null

    if (dataParam) {
        try {
            const decoded = atob(decodeURIComponent(dataParam))
            certificateData = JSON.parse(decoded)
        } catch (e) {
            console.error('Failed to decode certificate data:', e)
        }
    }

    const { id } = params

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Back button */}
            <div className="p-4 md:p-8">
                <Link href="/">
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à l'accueil
                    </Button>
                </Link>
            </div>

            {/* Certificate Display */}
            <div className="max-w-3xl mx-auto px-4 md:px-8 pb-8">
                <div className="relative bg-gradient-to-br from-card via-secondary to-card rounded-2xl border-2 border-primary/50 overflow-hidden">
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary rounded-br-2xl" />

                    {/* Glow effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                    <div className="relative p-8 md:p-12 text-center">
                        {/* Header with gradient logo */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Brain className="w-8 h-8 text-neon-cyan" />
                            <span
                                className="text-xl font-bold text-transparent bg-clip-text tracking-widest uppercase"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, var(--neon-cyan), var(--neon-purple), var(--neon-yellow))'
                                }}
                            >
                                Cognitive Labs
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent mb-8">
                            Certificat de Réussite
                        </h1>

                        {certificateData ? (
                            <>
                                {/* Award icon */}
                                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-secondary/50 border-3 border-current ${certificateData.percentage >= 90 ? "text-neon-yellow" :
                                        certificateData.percentage >= 80 ? "text-success" :
                                            certificateData.percentage >= 70 ? "text-primary" :
                                                certificateData.percentage >= 60 ? "text-accent" :
                                                    "text-destructive"
                                    }`}>
                                    <Award className="w-10 h-10" />
                                </div>

                                {/* Recipient */}
                                <p className="text-muted-foreground mb-2">Ce certificat est décerné à</p>
                                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                    {certificateData.firstName} {certificateData.lastName}
                                </h2>
                                <p className="text-primary mb-8">{certificateData.job}</p>

                                {/* Achievement */}
                                <p className="text-muted-foreground mb-4">
                                    Pour avoir complété avec succès
                                    <br />
                                    <span className="text-foreground font-semibold">"Maîtrise des biais cognitifs et phénomènes comportementaux"</span>
                                </p>

                                {/* Grade */}
                                <div className="inline-block p-4 rounded-xl bg-secondary/50 border border-border mb-6">
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const stars = certificateData.percentage >= 90 ? 5 :
                                                certificateData.percentage >= 80 ? 4 :
                                                    certificateData.percentage >= 70 ? 3 :
                                                        certificateData.percentage >= 60 ? 2 : 1
                                            return (
                                                <Star
                                                    key={i}
                                                    className={`w-6 h-6 ${i < stars ? "text-neon-yellow" : "text-muted"}`}
                                                    fill={i < stars ? "currentColor" : "transparent"}
                                                />
                                            )
                                        })}
                                    </div>
                                    <p className="text-2xl font-bold text-neon-yellow">Grade : {certificateData.grade}</p>
                                    <p className="text-muted-foreground mt-1">
                                        Score final : {certificateData.score}/{certificateData.totalQuestions} ({certificateData.percentage}%)
                                    </p>
                                </div>

                                {/* Date and ID */}
                                <p className="text-muted-foreground mb-2">Délivré le {certificateData.date}</p>
                                <p className="text-muted-foreground text-sm">ID du certificat : <span className="font-mono text-foreground">{id}</span></p>

                                {/* Verification badge */}
                                <div className="mt-8 p-4 bg-success/10 border border-success/30 rounded-lg inline-block">
                                    <p className="text-success font-semibold">
                                        ✓ Certificat authentique et vérifié
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-lg mb-4">
                                    🎉 Certificat vérifié par Cognitive Labs
                                </p>
                                <p className="text-muted-foreground mb-8">
                                    Certificat ID : <span className="font-mono text-foreground">{id}</span>
                                </p>
                                <div className="bg-card/50 border border-border rounded-lg p-6 max-w-md mx-auto">
                                    <p className="text-sm text-muted-foreground">
                                        Ce certificat est valide et authentifié par Cognitive Labs.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
