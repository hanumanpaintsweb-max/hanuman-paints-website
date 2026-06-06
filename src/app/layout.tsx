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
  description:
    'Buy genuine Dulux paints online in Madhubani. 5% discount on all orders. Cash on delivery available.',
  keywords: 'Dulux paints Madhubani, paint shop Madhubani, Hanuman Paints Madhubani, buy paint online Bihar, Dulux dealer Madhubani Bihar',
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
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
