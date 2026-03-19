import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();

  if (session.role === "TEACHER") {
    redirect("/dashboard/teacher");
  }

  if (session.role === "STUDENT") {
    redirect("/dashboard/student");
  }

  redirect("/dashboard/admin");
}
