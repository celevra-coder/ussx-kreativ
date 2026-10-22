import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminNavigation from "@/components/admin/AdminNavigation";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <>
      <AdminNavigation />
      {children}
    </>
  );
}
