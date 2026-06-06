import { Metadata } from 'next'
import ClientAdminLayout from './client-layout'

export const metadata: Metadata = {
  robots: 'noindex, nofollow'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClientAdminLayout>{children}</ClientAdminLayout>
}
