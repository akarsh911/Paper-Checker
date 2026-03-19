import path from "path";
import { Role, SubmissionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAuthorizedApiSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { evaluateSubmissionWithGemini } from "@/lib/gemini";
import { saveUploadedFile } from "@/lib/storage";
import { submissionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedApiSession([Role.TEACHER]);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session } = auth;
    const formData = await request.formData();
    const answerSheet = formData.get("answerSheet");

    if (!(answerSheet instanceof File)) {
      return NextResponse.json({ error: "Answer sheet PDF is required." }, { status: 400 });
    }

    const parsed = submissionSchema.parse({
      checkingSetId: formData.get("checkingSetId"),
      studentName: formData.get("studentName"),
      studentRollNumber: formData.get("studentRollNumber"),
      classGrade: formData.get("classGrade"),
      section: formData.get("section"),
      studentId: formData.get("studentId")
    });

    const checkingSet = await db.checkingSet.findFirst({
      where: {
        id: parsed.checkingSetId,
        teacherId: session.sub
      }
    });

    if (!checkingSet) {
      return NextResponse.json({ error: "Checking set not found." }, { status: 404 });
    }

    const answerSheetUpload = await saveUploadedFile(
      answerSheet,
      `schools/${checkingSet.schoolId}/submissions/${checkingSet.id}`
    );

    const submission = await db.submission.create({
      data: {
        checkingSetId: checkingSet.id,
        studentName: parsed.studentName,
        studentRollNumber: parsed.studentRollNumber,
        classGrade: parsed.classGrade,
        section: parsed.section || null,
        studentId: parsed.studentId || null,
        reviewerTeacherId: session.sub,
        answerSheetPath: answerSheetUpload.relativePath
      }
    });

    try {
      const evaluation = await evaluateSubmissionWithGemini({
        questionPaperPath: path.join(process.cwd(), checkingSet.questionPaperPath),
        answerKeyPath: checkingSet.answerKeyPath
          ? path.join(process.cwd(), checkingSet.answerKeyPath)
          : null,
        answerSheetPath: path.join(process.cwd(), answerSheetUpload.relativePath),
        classGrade: checkingSet.classGrade,
        totalMarks: checkingSet.totalMarks,
        customInstructions: checkingSet.customInstructions
      });

      await db.evaluationReport.create({
        data: {
          submissionId: submission.id,
          summary: evaluation.summary,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          totalMarks: evaluation.totalMarks,
          awardedMarks: evaluation.awardedMarks,
          gradingPrompt: evaluation.gradingPrompt,
          rawResponse: evaluation.rawResponse,
          questionBreakdown: JSON.stringify(evaluation.questionBreakdown)
        }
      });

      await db.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.EVALUATED,
          totalAwarded: evaluation.awardedMarks
        }
      });
    } catch (error) {
      await db.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.FAILED,
          failureReason: error instanceof Error ? error.message : "Gemini evaluation failed."
        }
      });
    }

    const freshSubmission = await db.submission.findUnique({
      where: { id: submission.id },
      include: {
        evaluationReport: true
      }
    });

    return NextResponse.json(freshSubmission);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to submit answer sheet." },
      { status: 400 }
    );
  }
}
