import { Metadata } from 'next'
import ClientAdminLayout from './client-layout'

export const metadata: Metadata = {
  title: 'Admin Panel — Hanuman Paints',
  description: 'Hanuman Paints Admin',
  robots: 'noindex, nofollow',
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' }
    ],
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>
}
