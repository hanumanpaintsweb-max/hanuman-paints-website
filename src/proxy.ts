import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname

  // Admin subdomain
  if (hostname === 'admin.hanumanpaints.in') {
    // Sirf /admin routes allow karo
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(
        new URL('/admin', request.url)
      )
    }
    return NextResponse.next()
  }

  // Main domain pe /admin block karo
  if (
    hostname === 'www.hanumanpaints.in' ||
    hostname === 'hanumanpaints.in'
  ) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.rewrite(
        new URL('/404', request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
