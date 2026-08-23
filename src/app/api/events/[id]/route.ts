import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      organizer: { select: { id: true, name: true } },
      teams: {
        include: { members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
      },
      participants: { select: { userId: true } },
      _count: { select: { participants: true, teams: true } },
    },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isJoined = meId ? event.participants.some((p) => p.userId === meId) : false;
  return NextResponse.json({ event: { ...event, isJoined } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (event.organizerId !== meId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.event.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ event: updated });
}