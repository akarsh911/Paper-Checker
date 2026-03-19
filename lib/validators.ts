import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const schoolSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(30)
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SCHOOL_ADMIN", "TEACHER", "STUDENT"]),
  schoolId: z.string().min(1),
  classGrade: z.string().optional(),
  section: z.string().optional(),
  rollNumber: z.string().optional()
});

export const checkingSetSchema = z.object({
  title: z.string().min(2),
  subject: z.string().min(2),
  classGrade: z.string().min(1),
  section: z.string().nullable().optional(),
  totalMarks: z.coerce.number().min(1),
  customInstructions: z.string().nullable().optional()
});

export const submissionSchema = z.object({
  checkingSetId: z.string().min(1),
  studentName: z.string().min(2),
  studentRollNumber: z.string().min(1),
  classGrade: z.string().min(1),
  section: z.string().nullable().optional(),
  studentId: z.string().nullable().optional()
});
