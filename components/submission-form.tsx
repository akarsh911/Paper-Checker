"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SubmissionFormProps = {
  checkingSetId: string;
  classGrade: string;
  section?: string | null;
  students: {
    id: string;
    name: string;
    rollNumber: string | null;
  }[];
};

export function SubmissionForm({ checkingSetId, classGrade, section, students }: SubmissionFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setMessage("");

    formData.set("checkingSetId", checkingSetId);
    formData.set("classGrade", classGrade);
    if (section) {
      formData.set("section", section);
    }

    const response = await fetch("/api/submissions", {
      method: "POST",
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Unable to evaluate submission.");
      setLoading(false);
      return;
    }

    setMessage("Answer sheet uploaded and evaluated.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="form-card">
      <div className="stack">
        <div>
          <p className="kicker">Evaluate student</p>
          <h2>Upload handwritten answer sheet</h2>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Student record (optional)</span>
            <select name="studentId" defaultValue="">
              <option value="">Manual entry</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.rollNumber ? `(${student.rollNumber})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Student name</span>
            <input name="studentName" required />
          </label>
          <label className="field">
            <span>Roll number</span>
            <input name="studentRollNumber" required />
          </label>
          <label className="field">
            <span>Answer sheet PDF</span>
            <input type="file" name="answerSheet" accept="application/pdf" required />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Evaluating..." : "Upload and evaluate"}
        </button>
      </div>
    </form>
  );
}
