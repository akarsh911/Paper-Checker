import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { SubmissionForm } from "@/components/submission-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseBreakdown(value: string) {
  return JSON.parse(value) as Array<{
    questionNumber: string;
    awardedMarks: number;
    maxMarks: number;
    feedback: string;
    deductionReason: string;
  }>;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckingSetDetailPage({ params }: PageProps) {
  const session = await requireRole([Role.TEACHER]);
  const { id } = await params;

  const checkingSet = await db.checkingSet.findFirst({
    where: {
      id,
      teacherId: session.sub
    },
    include: {
      submissions: {
        include: {
          evaluationReport: true
        },
        orderBy: { createdAt: "desc" }
      },
      school: true
    }
  });

  if (!checkingSet) {
    notFound();
  }

  const students = await db.user.findMany({
    where: {
      schoolId: checkingSet.schoolId,
      role: "STUDENT",
      classGrade: checkingSet.classGrade,
      ...(checkingSet.section ? { section: checkingSet.section } : {})
    },
    orderBy: { name: "asc" }
  });

  return (
    <main className="stack">
      <section className="hero-card stack">
        <span className="eyebrow">{checkingSet.school.name}</span>
        <h1>{checkingSet.title}</h1>
        <p className="subtitle">
          Subject: {checkingSet.subject} | Grade: {checkingSet.classGrade}
          {checkingSet.section ? `-${checkingSet.section}` : ""} | Total marks: {checkingSet.totalMarks}
        </p>
        <p className="muted">
          Default grading prompt is applied automatically. Teacher instructions are appended for this set.
        </p>
      </section>

      <SubmissionForm
        checkingSetId={checkingSet.id}
        classGrade={checkingSet.classGrade}
        section={checkingSet.section}
        students={students.map((student) => ({
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber
        }))}
      />

      <section className="table-card">
        <h2>Evaluated submissions</h2>
        <div className="stack">
          {checkingSet.submissions.map((submission) => (
            <article className="report-card" key={submission.id}>
              <div className="section-title">
                <div>
                  <h3>
                    {submission.studentName} ({submission.studentRollNumber})
                  </h3>
                  <p className="muted">
                    Status: {submission.status}
                    {submission.evaluationReport
                      ? ` | ${submission.evaluationReport.awardedMarks}/${submission.evaluationReport.totalMarks}`
                      : ""}
                  </p>
                </div>
              </div>

              {submission.evaluationReport ? (
                <div className="stack">
                  <p>{submission.evaluationReport.summary}</p>
                  <p className="muted">Strengths: {submission.evaluationReport.strengths}</p>
                  <p className="muted">Improvements: {submission.evaluationReport.improvements}</p>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Question</th>
                        <th>Marks</th>
                        <th>Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseBreakdown(submission.evaluationReport.questionBreakdown).map((item) => (
                        <tr key={item.questionNumber}>
                          <td>{item.questionNumber}</td>
                          <td>
                            {item.awardedMarks}/{item.maxMarks}
                          </td>
                          <td>
                            {item.feedback}
                            <div className="muted">Deduction: {item.deductionReason}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="error">{submission.failureReason || "Evaluation pending."}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
