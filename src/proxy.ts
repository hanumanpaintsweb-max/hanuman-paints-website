import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  
  // Check if we are on the admin subdomain
  const isAdminSubdomain = hostname.startsWith('admin.')
  
  // Exclude static assets and API routes from middleware logic
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // 1. On Admin Subdomain: Serve the admin panel
  if (isAdminSubdomain) {
    // If they hit the root of the admin subdomain, rewrite to /admin/dashboard
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/admin/dashboard', request.url))
    }
    
    // If they are hitting a non-admin path on the admin subdomain, rewrite it to /admin/[path]
    // OR if they hit /admin/... just serve it.
    if (!pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
    }
    
    return NextResponse.next()
  }

  // 2. On Main Domain: Block access to /admin routes for security
  if (!isAdminSubdomain && pathname.startsWith('/admin')) {
    // For enhanced security, return a 404 so bad actors don't even know it exists
    request.nextUrl.pathname = '/_not-found'
    return NextResponse.rewrite(request.nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
