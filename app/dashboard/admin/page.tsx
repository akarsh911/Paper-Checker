import { Role } from "@prisma/client";
import { CreateSchoolForm } from "@/components/create-school-form";
import { CreateUserForm } from "@/components/create-user-form";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireRole([Role.SUPER_ADMIN, Role.SCHOOL_ADMIN]);

  const [schools, users, sets, submissions] = await Promise.all([
    db.school.findMany({
      orderBy: { createdAt: "desc" }
    }),
    db.user.findMany({
      where: session.role === Role.SCHOOL_ADMIN ? { schoolId: session.schoolId ?? undefined } : undefined,
      include: {
        school: true
      },
      orderBy: { createdAt: "desc" }
    }),
    db.checkingSet.findMany({
      where: session.role === Role.SCHOOL_ADMIN ? { schoolId: session.schoolId ?? undefined } : undefined,
      include: {
        teacher: true,
        school: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    db.submission.findMany({
      where:
        session.role === Role.SCHOOL_ADMIN
          ? {
              checkingSet: {
                schoolId: session.schoolId ?? undefined
              }
            }
          : undefined,
      include: {
        checkingSet: true,
        evaluationReport: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  const fixedSchoolId = session.role === Role.SCHOOL_ADMIN ? session.schoolId : null;

  return (
    <main className="stack">
      <section className="section-title">
        <div>
          <p className="kicker">{session.role === Role.SUPER_ADMIN ? "Platform" : "School"} administration</p>
          <h1>Manage schools, users, and monitoring</h1>
        </div>
        <p className="muted">
          {session.role === Role.SUPER_ADMIN
            ? "Super admins can create schools and users across the platform."
            : "School admins can manage teachers and students in their own school."}
        </p>
      </section>

      <section className="grid-3">
        <div className="stat">
          <h3>{schools.length}</h3>
          <p className="muted">Schools</p>
        </div>
        <div className="stat">
          <h3>{users.length}</h3>
          <p className="muted">Users in scope</p>
        </div>
        <div className="stat">
          <h3>{submissions.length}</h3>
          <p className="muted">Recent evaluations</p>
        </div>
      </section>

      <section className="grid-2">
        {session.role === Role.SUPER_ADMIN ? <CreateSchoolForm /> : null}
        <CreateUserForm
          schools={schools.map((school) => ({ id: school.id, name: school.name }))}
          fixedSchoolId={fixedSchoolId}
        />
      </section>

      <section className="grid-2">
        <div className="table-card">
          <h2>Schools</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>{school.code}</td>
                  <td>{school.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h2>Users</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>School</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.school?.name || "Platform"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-2">
        <div className="table-card">
          <h2>Recent checking sets</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Teacher</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.teacher.name}</td>
                  <td>
                    {item.classGrade}
                    {item.section ? `-${item.section}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h2>Recent reports</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.studentName}</td>
                  <td>{submission.status}</td>
                  <td>
                    {submission.evaluationReport
                      ? `${submission.evaluationReport.awardedMarks}/${submission.evaluationReport.totalMarks}`
                      : "-"}
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
