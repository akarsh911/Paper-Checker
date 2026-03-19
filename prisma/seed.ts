import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("password123");

  const school = await prisma.school.upsert({
    where: { code: "GREENFIELD" },
    update: {},
    create: {
      name: "Greenfield Public School",
      code: "GREENFIELD"
    }
  });

  const users = [
    {
      email: "superadmin@paperchecker.local",
      name: "Platform Super Admin",
      role: Role.SUPER_ADMIN,
      schoolId: null
    },
    {
      email: "schooladmin@greenfield.local",
      name: "Greenfield Admin",
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id
    },
    {
      email: "teacher@greenfield.local",
      name: "Anita Sharma",
      role: Role.TEACHER,
      schoolId: school.id
    },
    {
      email: "student@greenfield.local",
      name: "Rahul Verma",
      role: Role.STUDENT,
      schoolId: school.id,
      classGrade: "8",
      section: "A",
      rollNumber: "18"
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        schoolId: user.schoolId,
        classGrade: "classGrade" in user ? user.classGrade : null,
        section: "section" in user ? user.section : null,
        rollNumber: "rollNumber" in user ? user.rollNumber : null
      },
      create: {
        ...user,
        passwordHash
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
