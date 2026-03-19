"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateSchoolForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setMessage("");

    const response = await fetch("/api/schools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: formData.get("name"),
        code: formData.get("code")
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Unable to create school.");
      return;
    }

    setMessage("School created.");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="form-card">
      <div className="stack">
        <div>
          <p className="kicker">Super admin</p>
          <h2>Create school</h2>
        </div>
        <label className="field">
          <span>School name</span>
          <input name="name" placeholder="Greenfield Public School" required />
        </label>
        <label className="field">
          <span>School code</span>
          <input name="code" placeholder="GREENFIELD" required />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
        <button className="btn" type="submit">
          Save school
        </button>
      </div>
    </form>
  );
}
