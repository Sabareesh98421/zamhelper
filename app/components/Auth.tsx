"use client";
import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthForm() {
  const supabase = createClient();

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      "http://localhost:3000/";
    // Make sure to include `https://` when not localhost.
    url = url.includes("http") ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
    return `${url}auth/callback`;
  };

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={["google"]}
      onlyThirdPartyProviders={true}
      redirectTo={getURL()}
      queryParams={{
        scope: "openid email profile",
      }}
    />
  );
}
