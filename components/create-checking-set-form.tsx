"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateCheckingSetForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setMessage("");

    const response = await fetch("/api/checking-sets", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Unable to create checking set.");
      return;
    }

    setMessage("Checking set created.");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="form-card">
      <div className="stack">
        <div>
          <p className="kicker">Teacher workflow</p>
          <h2>Create checking set</h2>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Title</span>
            <input name="title" placeholder="Unit Test 2 - Science" required />
          </label>
          <label className="field">
            <span>Subject</span>
            <input name="subject" placeholder="Science" required />
          </label>
          <label className="field">
            <span>Class grade</span>
            <input name="classGrade" placeholder="8" required />
          </label>
          <label className="field">
            <span>Section</span>
            <input name="section" placeholder="A" />
          </label>
          <label className="field">
            <span>Total marks</span>
            <input type="number" name="totalMarks" min="1" defaultValue="50" required />
          </label>
          <label className="field">
            <span>Question paper PDF</span>
            <input type="file" name="questionPaper" accept="application/pdf" required />
          </label>
          <label className="field">
            <span>Answer key PDF (optional)</span>
            <input type="file" name="answerKey" accept="application/pdf" />
          </label>
          <label className="field field-full">
            <span>Teacher instructions</span>
            <textarea
              name="customInstructions"
              placeholder="Evaluate like class 8 board examiner. Give step marks in long answers. Ignore struck-out content."
            />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
        <button className="btn" type="submit">
          Save checking set
        </button>
      </div>
    </form>
  );
}
