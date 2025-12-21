'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login() {
  const headerList = await headers()
  const origin = headerList.get('origin') ?? ''

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || origin}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/?error=Could not authenticate user')
  }

  return redirect(data.url)
}
