import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="hero-card stack">
      <span className="eyebrow">Not found</span>
      <h1>The requested page does not exist.</h1>
      <p className="subtitle">Return to the main workspace or dashboard.</p>
      <div className="cta-row">
        <Link href="/" className="btn">
          Home
        </Link>
        <Link href="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
