import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mazzika Fest - Boka Lokal för Bröllop & Event | Göteborg',
  description: 'Boka lokal för bröllop, företagsevent, förlovning, födelsedag, student, kalas eller konferens. Kapacitet: 150 stående / 144 sittande. Transportgatan 37, Göteborg.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
