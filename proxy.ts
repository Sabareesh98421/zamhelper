import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 2. Domain Redirection Logic
  const host = request.headers.get('host') || ''

  // Define whitelisted emails for firebaseapp.com access
  // REPLACE THESE WITH REAL EMAILS
  const WHITELISTED_EMAILS = ['admin@example.com', 'tester@example.com']

  if (host.includes('firebaseapp.com')) {
    const isWhitelisted = user?.email && WHITELISTED_EMAILS.includes(user.email)

    if (!isWhitelisted) {
      // Redirect to the .web.app domain
      // We keep the pathname and search params
      const url = request.nextUrl.clone()
      url.hostname = 'zamhelper-240302.web.app'
      url.port = '' // Ensure port is cleared for production
      url.protocol = 'https'
      return NextResponse.redirect(url)
    }
  }

  const path = request.nextUrl.pathname;
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/upload') ||
    path.startsWith('/manage-pdfs') ||
    path.startsWith('/all-attempts');

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
