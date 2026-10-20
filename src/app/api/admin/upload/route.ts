import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
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

  const form =
    await request.formData();

  const file =
    form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Няма избрана снимка." },
      { status: 400 }
    );
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      {
        error:
          "Позволени са JPG, PNG и WEBP.",
      },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      {
        error:
          "Снимката трябва да е до 5 MB.",
      },
      { status: 400 }
    );
  }

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() || "jpg";

  const filename =
    `${crypto.randomUUID()}.${extension}`;

  const supabase =
    createAdminClient();

  const buffer =
    Buffer.from(
      await file.arrayBuffer()
    );

  const { error } =
    await supabase.storage
      .from("product-images")
      .upload(
        filename,
        buffer,
        {
          contentType: file.type,
          upsert: false,
        }
      );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  return NextResponse.json({
    url:
      publicUrlData.publicUrl,
  });
}
