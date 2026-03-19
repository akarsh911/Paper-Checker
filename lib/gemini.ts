import { readFile } from "fs/promises";
import { DEFAULT_EVALUATION_PROMPT } from "@/lib/default-prompt";

type GeminiEvaluationInput = {
  questionPaperPath: string;
  answerKeyPath?: string | null;
  answerSheetPath: string;
  classGrade: string;
  totalMarks: number;
  customInstructions?: string | null;
};

type QuestionBreakdown = {
  questionNumber: string;
  maxMarks: number;
  awardedMarks: number;
  feedback: string;
  deductionReason: string;
};

export type GeminiEvaluationResult = {
  summary: string;
  strengths: string;
  improvements: string;
  totalMarks: number;
  awardedMarks: number;
  questionBreakdown: QuestionBreakdown[];
  gradingPrompt: string;
  rawResponse: string;
};

function buildPrompt(input: GeminiEvaluationInput) {
  return `${DEFAULT_EVALUATION_PROMPT}

Class grade: ${input.classGrade}
Total marks: ${input.totalMarks}
Additional teacher instructions:
${input.customInstructions?.trim() || "No additional instructions."}

Return valid JSON in this exact shape:
{
  "summary": "string",
  "strengths": "string",
  "improvements": "string",
  "totalMarks": number,
  "awardedMarks": number,
  "questionBreakdown": [
    {
      "questionNumber": "1",
      "maxMarks": number,
      "awardedMarks": number,
      "feedback": "string",
      "deductionReason": "string"
    }
  ]
}`.trim();
}

function extractJson(rawText: string) {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini response did not contain JSON.");
  }

  return JSON.parse(jsonMatch[0]);
}

function toInlineData(buffer: Buffer) {
  return buffer.toString("base64");
}

export async function evaluateSubmissionWithGemini(
  input: GeminiEvaluationInput
): Promise<GeminiEvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const [questionPaper, answerSheet, answerKey] = await Promise.all([
    readFile(input.questionPaperPath),
    readFile(input.answerSheetPath),
    input.answerKeyPath ? readFile(input.answerKeyPath) : Promise.resolve(null)
  ]);

  const prompt = buildPrompt(input);
  const contents = [
    {
      role: "user",
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: "application/pdf",
            data: toInlineData(questionPaper)
          }
        },
        ...(answerKey
          ? [
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: toInlineData(answerKey)
                }
              }
            ]
          : []),
        {
          inline_data: {
            mime_type: "application/pdf",
            data: toInlineData(answerSheet)
          }
        }
      ]
    }
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        },
        contents
      })
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini API error: ${details}`);
  }

  const payload = await response.json();
  const rawText =
    payload.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("\n") || "";

  const parsed = extractJson(rawText);

  return {
    summary: parsed.summary,
    strengths: parsed.strengths,
    improvements: parsed.improvements,
    totalMarks: parsed.totalMarks,
    awardedMarks: parsed.awardedMarks,
    questionBreakdown: parsed.questionBreakdown,
    gradingPrompt: prompt,
    rawResponse: JSON.stringify(payload)
  };
}
