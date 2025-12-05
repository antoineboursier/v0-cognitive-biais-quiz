import type React from "react"
import type { Metadata, Viewport } from "next"

import "./globals.css"
import { Exo_2, Geist_Mono } from 'next/font/google'

// Initialize fonts
// Removed unused V0 fonts to prevent potential conflicts

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo-2",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cognitive-labs.vercel.app'), // Replace with your actual production URL
  title: "Cognitive Labs - Maîtrisez les Biais Cognitifs",
  description:
    "Entraînez votre cerveau à détecter les biais cognitifs utilisés en UX Design. Quiz interactif gamifié pour devenir expert en psychologie cognitive.",
  keywords: ["biais cognitifs", "UX design", "psychologie", "quiz", "gamification", "cognitive bias"],
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://cognitive-labs.vercel.app", // Replace with actual URL if known, or leave generic
    title: "Cognitive Labs - Maîtrisez les Biais Cognitifs",
    description: "Entraînez votre cerveau à détecter les biais cognitifs. Quiz interactif pour devenir expert en psychologie cognitive.",
    siteName: "Cognitive Labs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cognitive Labs Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognitive Labs - Maîtrisez les Biais Cognitifs",
    description: "Entraînez votre cerveau à détecter les biais cognitifs. Quiz interactif gamifié.",
    images: ["/og-image.png"],
    creator: "@CognitiveLabs", // Optional placeholder
  },
}

import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/lib/settings-context"
import { Toaster } from "sonner"

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${exo2.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
