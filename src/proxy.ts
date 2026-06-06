import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting (Edge compatible)
// Note: In a distributed edge environment like Vercel, this map resets per instance.
// For strict global rate limiting, a service like Upstash Redis is recommended.
const rateLimitMap = new Map<string, { count: number, resetTime: number }>()

export function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const path = request.nextUrl.pathname
  const now = Date.now()

  // Clean up expired entries periodically (10% chance per request to save compute)
  if (Math.random() < 0.1) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) rateLimitMap.delete(key)
    }
  }

  // Determine Rate Limit rules based on path
  let limit = 0
  let windowMs = 60000 // 1 minute window

  if (path.startsWith('/api/')) {
    limit = 100 // 100 requests per minute for APIs
  } else if (path === '/checkout' && request.method === 'POST') {
    // Treat POST requests to checkout (Server Actions) as order attempts
    limit = 5 // Max 5 orders per minute
  }

  // Apply Rate Limit if a limit rule matched
  if (limit > 0) {
    const key = `${ip}:${path}`
    const record = rateLimitMap.get(key)

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    } else {
      record.count += 1
      if (record.count > limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/checkout'
  ]
}
