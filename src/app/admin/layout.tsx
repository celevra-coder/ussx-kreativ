import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import AdminNavigation from "@/components/admin/AdminNavigation";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({
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
