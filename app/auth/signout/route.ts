import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  // Redirect to the current origin (protocol + host)
  // This automatically handles localhost vs production without needing configuration
  return NextResponse.redirect(request.nextUrl.origin, {
    status: 302,
  });
}
