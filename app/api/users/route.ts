import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAuthorizedApiSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { createUserSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedApiSession([Role.SUPER_ADMIN, Role.SCHOOL_ADMIN]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const payload = createUserSchema.parse(await request.json());

    if (session.role === Role.SCHOOL_ADMIN && payload.schoolId !== session.schoolId) {
      return NextResponse.json({ error: "School admins can only create users in their school." }, { status: 403 });
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await db.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash,
        role: payload.role,
        schoolId: payload.schoolId,
        classGrade: payload.classGrade || null,
        section: payload.section || null,
        rollNumber: payload.rollNumber || null
      }
    });

    return NextResponse.json({ user, sessionRole: session.role });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create user." },
      { status: 400 }
    );
  }
}
