import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => request.cookies.get(name)?.value,
                set: (name, value, options) => {
                    const newHeaders = new Headers(request.headers)
                    const newRequest = new NextRequest(request.url, { headers: newHeaders })
                    const response = NextResponse.next({ request: newRequest })
                    response.cookies.set(name, value, options)
                    return response
                },
                remove: (name, options) => {
                    const newHeaders = new Headers(request.headers)
                    const newRequest = new NextRequest(request.url, { headers: newHeaders })
                    const response = NextResponse.next({ request: newRequest })
                    response.cookies.set(name, '', options)
                    return response
                },
            },
        }
    )

    await supabase.auth.getUser()

    return NextResponse.next()
}
