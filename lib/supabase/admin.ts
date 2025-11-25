import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const { data: claims } = await supabase
    .from("claims")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (claims?.role !== "admin") {
    return redirect("/");
  }
}
