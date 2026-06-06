import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const hostname = request.headers.get('host')?.split(':')[0]
  const isAdminSubdomain = hostname === 'admin.hanumanpaints.in'
  const isMainDomain =
    hostname === 'www.hanumanpaints.in' ||
    hostname === 'hanumanpaints.in'
  const adminPath = isAdminSubdomain && !path.startsWith('/admin')
    ? '/admin'
    : path

  // Main domain admin block
  if (isMainDomain && path.startsWith('/admin')) {
    return NextResponse.rewrite(
      new URL('/404', request.url)
    )
  }

  // Server-side admin session check
  if (
    adminPath.startsWith('/admin') &&
    adminPath !== '/admin/login'
  ) {
    const adminSession = request.cookies.get('hp-admin')

    if (!adminSession) {
      return NextResponse.redirect(
        new URL('/admin/login', request.url)
      )
    }
  }

  // Admin subdomain routing
  if (isAdminSubdomain && !path.startsWith('/admin')) {
    return NextResponse.rewrite(
      new URL('/admin', request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
