import { checkAdmin } from "@/lib/supabase/admin";

export default async function AdminPage() {
  await checkAdmin();

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="animate-in flex-1 flex flex-col opacity-0 max-w-4xl px-3">
        <main className="flex-1 flex flex-col p-6">
          <h2 className="font-bold text-4xl mb-4">Admin</h2>
        </main>
      </div>
    </div>
  );
}
