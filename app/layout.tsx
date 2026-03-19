import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paper Checker",
  description: "AI-assisted handwritten exam evaluation for schools, teachers, and students."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <div className="topbar">
            <Link href="/" className="brand">
              <span className="eyebrow">Paper Checker</span>
              <strong>AI exam evaluation for handwritten papers</strong>
            </Link>

            <div className="cta-row">
              {session ? (
                <>
                  <Link href="/dashboard" className="btn-secondary">
                    Dashboard
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login" className="btn">
                  Login
                </Link>
              )}
            </div>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
