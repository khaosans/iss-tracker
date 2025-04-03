import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal'] })

export const metadata: Metadata = {
  title: 'ISS Tracker',
  description: 'Track the International Space Station in real time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}