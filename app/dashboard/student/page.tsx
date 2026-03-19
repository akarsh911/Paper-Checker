import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await requireRole([Role.STUDENT]);

  const student = await db.user.findUnique({
    where: { id: session.sub },
    include: {
      submissions: {
        include: {
          evaluationReport: true,
          checkingSet: true
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!student) {
    return null;
  }

  return (
    <main className="stack">
      <section className="hero-card stack">
        <span className="eyebrow">Student dashboard</span>
        <h1>{student.name}</h1>
        <p className="subtitle">
          Class {student.classGrade || "-"}
          {student.section ? `-${student.section}` : ""} | Roll no. {student.rollNumber || "-"}
        </p>
      </section>

      <section className="table-card">
        <h2>Your evaluated papers</h2>
        <div className="stack">
          {student.submissions.map((submission) => (
            <article className="report-card" key={submission.id}>
              <h3>{submission.checkingSet.title}</h3>
              <p className="muted">
                {submission.evaluationReport
                  ? `${submission.evaluationReport.awardedMarks}/${submission.evaluationReport.totalMarks}`
                  : submission.status}
              </p>
              {submission.evaluationReport ? (
                <>
                  <p>{submission.evaluationReport.summary}</p>
                  <p className="muted">Strengths: {submission.evaluationReport.strengths}</p>
                  <p className="muted">Improvements: {submission.evaluationReport.improvements}</p>
                </>
              ) : (
                <p className="error">{submission.failureReason || "Evaluation not available."}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
