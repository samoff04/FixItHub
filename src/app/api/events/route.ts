import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") ?? undefined;
  const upcoming = searchParams.get("upcoming") === "true";

  const events = await prisma.event.findMany({
    where: {
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(type ? { type } : {}),
      ...(upcoming ? { endDate: { gte: new Date() } } : {}),
    },
    include: {
      organizer: { select: { id: true, name: true } },
      _count: { select: { participants: true, teams: true } },
    },
    orderBy: { startDate: "asc" },
    take: 60,
  });

  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { startDate, endDate, ...rest } = parsed.data;
  if (new Date(endDate) <= new Date(startDate)) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: { ...rest, startDate: new Date(startDate), endDate: new Date(endDate), organizerId: meId },
    include: { organizer: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ event }, { status: 201 });
}