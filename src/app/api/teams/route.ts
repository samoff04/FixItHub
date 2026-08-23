import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { teamSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") ?? undefined;
  const openOnly = searchParams.get("open") === "true";
  const q = searchParams.get("q")?.trim();

  const teams = await prisma.team.findMany({
    where: {
      ...(eventId ? { eventId } : {}),
      ...(openOnly ? { isOpen: true } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
      event: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const team = await prisma.team.create({
    data: {
      ...parsed.data,
      leaderId: meId,
      members: { create: { userId: meId, role: "LEADER" } },
    },
    include: { members: { include: { user: true } }, event: true },
  });

  return NextResponse.json({ team }, { status: 201 });
}