import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PracticePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="animate-in flex-1 flex flex-col opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col p-6">
          <h2 className="font-bold text-4xl mb-4">Practice Exams</h2>
        </main>
      </div>
    </div>
  );
}
