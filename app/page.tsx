import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [schoolCount, teacherCount, studentCount, setCount] = await Promise.all([
    db.school.count(),
    db.user.count({ where: { role: "TEACHER" } }),
    db.user.count({ where: { role: "STUDENT" } }),
    db.checkingSet.count()
  ]);

  return (
    <main className="stack">
      <section className="hero-grid">
        <div className="hero-card stack">
          <span className="eyebrow">School workflow</span>
          <h1 className="title">Upload the question paper, handwritten answers, and let AI produce a proper report.</h1>
          <p className="subtitle">
            Teachers create checking sets with the question paper, optional answer key, grading prompt, and class context.
            Schools manage users and data access. Students can view final saved evaluations and answer-sheet history.
          </p>
          <div className="badge-row">
            <span className="badge">Role-based logins</span>
            <span className="badge">PDF upload pipeline</span>
            <span className="badge">Gemini evaluation</span>
            <span className="badge">Stored reports</span>
          </div>
          <div className="cta-row">
            <Link href="/login" className="btn">
              Open workspace
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Go to dashboard
            </Link>
          </div>
        </div>

        <div className="stack">
          <div className="stat">
            <p className="kicker">Live counts</p>
            <h3>{schoolCount} schools</h3>
            <p className="muted">Each school can have admins, teachers, students, and its own checking sets.</p>
          </div>
          <div className="grid-2">
            <div className="stat">
              <h3>{teacherCount}</h3>
              <p className="muted">Teachers</p>
            </div>
            <div className="stat">
              <h3>{studentCount}</h3>
              <p className="muted">Students</p>
            </div>
          </div>
          <div className="stat">
            <h3>{setCount} checking sets</h3>
            <p className="muted">Question paper, answer key, class instructions, and submissions live together.</p>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <article className="feature">
          <h3>Teacher flow</h3>
          <ul className="list">
            <li>Create a checking set for a grade, section, subject, and total marks.</li>
            <li>Upload the question paper PDF and optional answer key PDF.</li>
            <li>Upload handwritten answer sheets by student and trigger evaluation.</li>
          </ul>
        </article>
        <article className="feature">
          <h3>Evaluation flow</h3>
          <ul className="list">
            <li>Default grading prompt handles crossed-out answers, step marking, and fairness.</li>
            <li>Teacher custom instructions are appended per checking set.</li>
            <li>Question-wise marks, deductions, summary, and total awarded marks are stored.</li>
          </ul>
        </article>
        <article className="feature">
          <h3>Admin flow</h3>
          <ul className="list">
            <li>Super admins create schools.</li>
            <li>School admins create teachers and students for their school.</li>
            <li>Students can log in and review their evaluated submissions.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
