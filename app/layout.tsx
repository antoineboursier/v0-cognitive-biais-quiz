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
  title: "Cognitive Labs - Maîtrisez les Biais Cognitifs",
  description:
    "Entraînez votre cerveau à détecter les biais cognitifs utilisés en UX Design. Quiz interactif gamifié pour devenir expert en psychologie cognitive.",
  keywords: ["biais cognitifs", "UX design", "psychologie", "quiz", "gamification", "cognitive bias"],
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
  },
}

import { ThemeProvider } from "@/components/theme-provider"
import { SettingsProvider } from "@/lib/settings-context"

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
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
