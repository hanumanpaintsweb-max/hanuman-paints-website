import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { StoreProvider } from '@/lib/store'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import * as Sentry from '@sentry/nextjs'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Hanuman Paints — Authorized Dulux Dealer Madhubani',
  description: 'Madhubani ki sabse trusted paint shop. Genuine Dulux paints online order karo. 5% discount + Cash on delivery.',
  keywords: [
    'Dulux paints Madhubani',
    'paint shop Madhubani Bihar',
    'Hanuman Paints Madhubani',
    'buy paint online Madhubani',
    'Dulux dealer Madhubani',
    'wall paint Madhubani'
  ],
  openGraph: {
    title: 'Hanuman Paints',
    description: 'Authorized Dulux Dealer — Madhubani',
    url: 'https://www.hanumanpaints.in',
    siteName: 'Hanuman Paints',
    locale: 'en_IN',
    type: 'website',
  },
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' }
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <StoreProvider>{children}</StoreProvider>
            <Toaster position="top-right" richColors />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
