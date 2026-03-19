import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAuthorizedApiSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { checkingSetSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedApiSession([Role.TEACHER]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const formData = await request.formData();

    const questionPaper = formData.get("questionPaper");
    const answerKey = formData.get("answerKey");

    if (!(questionPaper instanceof File)) {
      return NextResponse.json({ error: "Question paper PDF is required." }, { status: 400 });
    }

    const parsed = checkingSetSchema.parse({
      title: formData.get("title"),
      subject: formData.get("subject"),
      classGrade: formData.get("classGrade"),
      section: formData.get("section"),
      totalMarks: formData.get("totalMarks"),
      customInstructions: formData.get("customInstructions")
    });

    const teacher = await db.user.findUnique({
      where: { id: session.sub }
    });

    if (!teacher?.schoolId) {
      return NextResponse.json({ error: "Teacher must belong to a school." }, { status: 400 });
    }

    const [questionPaperUpload, answerKeyUpload] = await Promise.all([
      saveUploadedFile(questionPaper, `schools/${teacher.schoolId}/question-papers`),
      answerKey instanceof File && answerKey.size > 0
        ? saveUploadedFile(answerKey, `schools/${teacher.schoolId}/answer-keys`)
        : Promise.resolve(null)
    ]);

    const checkingSet = await db.checkingSet.create({
      data: {
        ...parsed,
        section: parsed.section || null,
        customInstructions: parsed.customInstructions || null,
        teacherId: teacher.id,
        schoolId: teacher.schoolId,
        questionPaperPath: questionPaperUpload.relativePath,
        answerKeyPath: answerKeyUpload?.relativePath || null
      }
    });

    return NextResponse.json(checkingSet);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create checking set." },
      { status: 400 }
    );
  }
}
