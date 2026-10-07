import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PublicWhySelloraPage() {
  const session = await getSession();
  // اگه لاگینه، بره به نسخه‌ی داخل اپ
  if (session) redirect("/settings/why-sellora");
  // اگه نیست، نسخه‌ی عمومی رو نشون بده
  redirect("/settings/why-sellora?public=1");
}
