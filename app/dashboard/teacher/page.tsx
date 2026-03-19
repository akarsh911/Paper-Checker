import Link from "next/link";
import { Role } from "@prisma/client";
import { CreateCheckingSetForm } from "@/components/create-checking-set-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const session = await requireRole([Role.TEACHER]);

  const [sets, submissions] = await Promise.all([
    db.checkingSet.findMany({
      where: { teacherId: session.sub },
      include: {
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    db.submission.findMany({
      where: { reviewerTeacherId: session.sub },
      include: {
        evaluationReport: true,
        checkingSet: true
      },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  const evaluatedCount = submissions.filter((item) => item.status === "EVALUATED").length;

  return (
    <main className="stack">
      <section className="section-title">
        <div>
          <p className="kicker">Teacher workspace</p>
          <h1>Prepare question papers and evaluate answer sheets.</h1>
        </div>
        <p className="muted">
          Every submission is tied to a checking set so the grading context stays consistent across students.
        </p>
      </section>

      <section className="grid-3">
        <div className="stat">
          <h3>{sets.length}</h3>
          <p className="muted">Checking sets</p>
        </div>
        <div className="stat">
          <h3>{submissions.length}</h3>
          <p className="muted">Recent submissions</p>
        </div>
        <div className="stat">
          <h3>{evaluatedCount}</h3>
          <p className="muted">Evaluated reports</p>
        </div>
      </section>

      <CreateCheckingSetForm />

      <section className="grid-2">
        <div className="table-card">
          <h2>Checking sets</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.id}>
                  <td>
                    <Link href={`/dashboard/teacher/checking-sets/${set.id}`}>{set.title}</Link>
                  </td>
                  <td>{set.subject}</td>
                  <td>{set._count.submissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h2>Recent evaluations</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Set</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.studentName}</td>
                  <td>{submission.checkingSet.title}</td>
                  <td>
                    {submission.evaluationReport
                      ? `${submission.evaluationReport.awardedMarks}/${submission.evaluationReport.totalMarks}`
                      : submission.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
