import { createSupabaseServerClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await supabase.auth.signOut();
  }

  // The NEXT_PUBLIC_BASE_URL is set in apphosting.yaml to the public URL of the app.
  // Using it here ensures that after sign-out, the user is redirected to the
  // correct homepage, avoiding the internal 0.0.0.0 address.
  return NextResponse.redirect(process.env.NEXT_PUBLIC_BASE_URL!, {
    status: 302,
  });
}
