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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <div className="topbar">
            <Link href="/" className="brand">
              <span className="logo">PC</span>
              <span className="brand-text">
                <span className="eyebrow">Paper Checker</span>
                <strong>AI exam evaluation for handwritten papers</strong>
              </span>
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
