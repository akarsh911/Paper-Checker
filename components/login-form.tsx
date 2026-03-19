"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Unable to sign in.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="form-card"
      action={handleSubmit}
    >
      <div className="stack">
        <div>
          <p className="kicker">Credentials</p>
          <h2>Login to your role-based workspace</h2>
        </div>

        <label className="field">
          <span>Email</span>
          <input type="email" name="email" placeholder="teacher@greenfield.local" required />
        </label>

        <label className="field">
          <span>Password</span>
          <input type="password" name="password" placeholder="password123" required />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="muted">
          Demo users after seeding: `superadmin@paperchecker.local`, `schooladmin@greenfield.local`,
          `teacher@greenfield.local`, `student@greenfield.local`
        </p>
      </div>
    </form>
  );
}
