'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function resolveFaultAction(faultId: number): Promise<{ success: boolean; message: string }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('parsing_faults')
    .update({ is_resolved: true })
    .eq('id', faultId);

  if (error) {
    return { success: false, message: `Failed to resolve fault: ${error.message}` };
  }

  return { success: true, message: 'Fault marked as resolved.' };
}
