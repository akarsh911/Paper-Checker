import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="grid-2">
      <section className="hero-card stack">
        <span className="eyebrow">Paper Checker</span>
        <h1 className="title">One login, different workspaces for admins, teachers, and students.</h1>
        <p className="subtitle">
          Use seeded credentials for the initial run, then create schools, teachers, and students from the admin dashboard.
        </p>
      </section>
      <LoginForm />
    </main>
  );
}
