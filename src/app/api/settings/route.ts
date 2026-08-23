import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.userSettings.findUnique({ where: { userId: meId } });
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const settings = await prisma.userSettings.upsert({
    where: { userId: meId },
    update: parsed.data,
    create: { userId: meId, ...parsed.data },
  });

  return NextResponse.json({ settings });
}