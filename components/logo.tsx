"use client"

import { Brain } from "lucide-react"

interface LogoProps {
    size?: 'small' | 'medium' | 'large'
    className?: string
}

export function Logo({ size = 'large', className = '' }: LogoProps) {
    const sizes = {
        small: {
            icon: 'w-8 h-8',
            text: 'text-3xl',
            gap: 'gap-2',
            padding: 'py-2'
        },
        medium: {
            icon: 'w-10 h-10',
            text: 'text-4xl',
            gap: 'gap-2',
            padding: 'py-3'
        },
        large: {
            icon: 'w-12 h-12',
            text: 'text-6xl',
            gap: 'gap-3',
            padding: 'py-4'
        }
    }

    const currentSize = sizes[size]

    return (
        <div className={`inline-flex flex-col md:flex-row items-center ${currentSize.gap} ${className}`}>
            <Brain className={`${currentSize.icon} text-neon-cyan`} />
            <h1
                className={`font-bold text-transparent bg-clip-text ${currentSize.text} ${currentSize.padding}`}
                style={{
                    backgroundImage: 'linear-gradient(to right, var(--neon-cyan), var(--neon-purple), var(--neon-yellow))'
                }}
            >
                Cognitive Labs
            </h1>
        </div>
    )
}
