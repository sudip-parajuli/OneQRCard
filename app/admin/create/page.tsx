import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminCreateClient from "./AdminCreateClient";

export const revalidate = 0;

export default async function AdminCreatePage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "sparajuli802@gmail.com";

  if (!user || user.email !== adminEmail) {
    redirect("/admin");
  }

  return <AdminCreateClient />;
}
