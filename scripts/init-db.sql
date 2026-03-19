PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "School" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL UNIQUE,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "classGrade" TEXT,
  "section" TEXT,
  "rollNumber" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "schoolId" TEXT,
  CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CheckingSet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "classGrade" TEXT NOT NULL,
  "section" TEXT,
  "totalMarks" INTEGER NOT NULL,
  "customInstructions" TEXT,
  "defaultPromptVersion" TEXT NOT NULL DEFAULT 'v1',
  "questionPaperPath" TEXT NOT NULL,
  "answerKeyPath" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "schoolId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  CONSTRAINT "CheckingSet_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CheckingSet_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Submission" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "studentName" TEXT NOT NULL,
  "studentRollNumber" TEXT NOT NULL,
  "classGrade" TEXT NOT NULL,
  "section" TEXT,
  "answerSheetPath" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "failureReason" TEXT,
  "totalAwarded" REAL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "checkingSetId" TEXT NOT NULL,
  "studentId" TEXT,
  "reviewerTeacherId" TEXT NOT NULL,
  CONSTRAINT "Submission_checkingSetId_fkey" FOREIGN KEY ("checkingSetId") REFERENCES "CheckingSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Submission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Submission_reviewerTeacherId_fkey" FOREIGN KEY ("reviewerTeacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "EvaluationReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "summary" TEXT NOT NULL,
  "strengths" TEXT NOT NULL,
  "improvements" TEXT NOT NULL,
  "totalMarks" REAL NOT NULL,
  "awardedMarks" REAL NOT NULL,
  "gradingPrompt" TEXT NOT NULL,
  "rawResponse" TEXT NOT NULL,
  "questionBreakdown" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submissionId" TEXT NOT NULL UNIQUE,
  CONSTRAINT "EvaluationReport_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
