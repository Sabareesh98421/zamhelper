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
      // Redirect to the configured application URL
      // We keep the pathname and search params
      const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL;
      if (appUrlEnv) {
        try {
          const targetUrl = new URL(appUrlEnv);
          const url = request.nextUrl.clone();
          url.hostname = targetUrl.hostname;
          url.protocol = targetUrl.protocol;
          url.port = targetUrl.port; // In proper production this is usually empty or 443 implies https

          // Only redirect if we are not already on the correct hostname to avoid loops
          if (host !== targetUrl.host) {
            return NextResponse.redirect(url);
          }
        } catch (e) {
          console.error('Failed to parse NEXT_PUBLIC_APP_URL', e);
        }
      }
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
