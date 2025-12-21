import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  // Redirect to the application URL (env var) or fallback to origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  return NextResponse.redirect(appUrl, {
    status: 302,
  });
}
