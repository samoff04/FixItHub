import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SKILLS = [
  ["React", "Frontend"], ["Next.js", "Frontend"], ["TypeScript", "Language"],
  ["Node.js", "Backend"], ["Python", "Language"], ["Django", "Backend"],
  ["PostgreSQL", "Database"], ["MongoDB", "Database"], ["TensorFlow", "ML"],
  ["PyTorch", "ML"], ["Figma", "Design"], ["UI/UX", "Design"],
  ["Solidity", "Blockchain"], ["Flutter", "Mobile"], ["Swift", "Mobile"],
  ["Docker", "DevOps"], ["AWS", "DevOps"], ["GraphQL", "Backend"],
  ["Product Management", "PM"], ["Data Analysis", "Data"],
];

async function main() {
  for (const [name, category] of SKILLS) {
    await prisma.skill.upsert({ where: { name }, update: {}, create: { name, category } });
  }

  const adminPassword = await bcrypt.hash("Admin@1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fixithub.dev" },
    update: {},
    create: {
      email: "admin@fixithub.dev",
      username: "admin",
      name: "FixitHub Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      bio: "Platform administrator.",
      goals: ["hackathon"],
      roles: ["organizer"],
      settings: { create: {} },
    },
  });

  console.log("Seeded skills and admin user:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });