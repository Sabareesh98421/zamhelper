'use client'

import { createClient } from '@/lib/supabase/client'
// import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function AuthPage() {
  const supabase = createClient()

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-1/3">
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                queryParams: {
                  scope: "openid email profile"
                },
                redirectTo: "https://zamhelper.web.app/auth/callback"
              }
            })
          }
          className="bg-blue-600 mt-4 p-2 w-full text-white rounded"
        >
          Sign in with Google
        </button>

      </div>
    </div>
  )
}
