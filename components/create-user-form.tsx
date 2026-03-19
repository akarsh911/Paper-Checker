"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateUserFormProps = {
  schools: { id: string; name: string }[];
  fixedSchoolId?: string | null;
};

export function CreateUserForm({ schools, fixedSchoolId }: CreateUserFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setMessage("");

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      schoolId: fixedSchoolId || formData.get("schoolId"),
      classGrade: formData.get("classGrade"),
      section: formData.get("section"),
      rollNumber: formData.get("rollNumber")
    };

    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok) {
      setError(json.error || "Unable to create user.");
      return;
    }

    setMessage("User created.");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="form-card">
      <div className="stack">
        <div>
          <p className="kicker">Administration</p>
          <h2>Create user</h2>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input name="name" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" name="password" defaultValue="password123" required />
          </label>
          <label className="field">
            <span>Role</span>
            <select name="role" defaultValue="TEACHER">
              <option value="SCHOOL_ADMIN">School admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </label>
          {!fixedSchoolId ? (
            <label className="field">
              <span>School</span>
              <select name="schoolId" required>
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="field">
            <span>Class grade</span>
            <input name="classGrade" placeholder="8" />
          </label>
          <label className="field">
            <span>Section</span>
            <input name="section" placeholder="A" />
          </label>
          <label className="field">
            <span>Roll number</span>
            <input name="rollNumber" placeholder="18" />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="success">{message}</p> : null}
        <button className="btn" type="submit">
          Create account
        </button>
      </div>
    </form>
  );
}
