import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminCreateClient from "./AdminCreateClient";

export const revalidate = 0;

export default async function AdminCreatePage() {
  const supabase = createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";

  if (!session || session.user.email !== adminEmail) {
    redirect("/admin");
  }

  return <AdminCreateClient />;
}
