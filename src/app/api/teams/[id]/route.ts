import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { teamSchema } from "@/lib/validations";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true, isOnline: true } } } },
      event: true,
    },
  });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ team });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (team.leaderId !== meId) return NextResponse.json({ error: "Only the leader can edit this team" }, { status: 403 });

  const body = await req.json();
  const parsed = teamSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const updated = await prisma.team.update({
    where: { id: params.id },
    data: parsed.data,
    include: { members: { include: { user: true } }, event: true },
  });

  return NextResponse.json({ team: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (team.leaderId !== meId) return NextResponse.json({ error: "Only the leader can delete this team" }, { status: 403 });

  await prisma.team.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}