'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function AuthPage() {
  const supabase = createClient()

  return (
    <div className="flex justify-center items-center h-screen">
        <div className="w-1/3">
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google']}
                redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
            />
        </div>
    </div>
  )
}
