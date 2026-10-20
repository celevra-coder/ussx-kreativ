import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await createClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabase =
    createAdminClient();

  const { data, error } =
    await supabase
      .from("categories")
      .select(
        "id,name,slug"
      )
      .eq("active", true)
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    categories: data ?? [],
  });
}
