import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAuthorizedApiSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { schoolSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedApiSession([Role.SUPER_ADMIN]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const data = schoolSchema.parse(await request.json());

    const school = await db.school.create({
      data
    });

    return NextResponse.json(school);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create school." },
      { status: 400 }
    );
  }
}
