const { PrismaClient, Role } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const passwordHash = hashPassword("password123");

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
      schoolId: null,
      classGrade: null,
      section: null,
      rollNumber: null
    },
    {
      email: "schooladmin@greenfield.local",
      name: "Greenfield Admin",
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id,
      classGrade: null,
      section: null,
      rollNumber: null
    },
    {
      email: "teacher@greenfield.local",
      name: "Anita Sharma",
      role: Role.TEACHER,
      schoolId: school.id,
      classGrade: null,
      section: null,
      rollNumber: null
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
        classGrade: user.classGrade,
        section: user.section,
        rollNumber: user.rollNumber
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
