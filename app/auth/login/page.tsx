"use client";
import { createClient } from "@/lib/supabase/client";
export default function AuthPage() {
  const supabase = createClient();
  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_BASE_URL ?? // Set this to your site URL in production env.
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      "http://localhost:3000/";
    // Make sure to include `https://` when not localhost.
    url = url.includes("http") ? url : `https://${url}`;
    // Make sure to include a trailing `/`.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
    url = `${url}auth/callback`;
    return url;
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-1/3">
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                queryParams: {
                  scope: "openid email profile",
                },
                redirectTo: getURL(),
              },
            })
          }
          className="bg-blue-600 mt-4 p-2 w-full text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
