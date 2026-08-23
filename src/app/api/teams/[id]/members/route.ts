import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { emitToUser } from "@/lib/socket-server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id }, include: { members: true } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!team.isOpen) return NextResponse.json({ error: "This team is not accepting members" }, { status: 409 });
  if (team.members.length >= team.maxMembers) return NextResponse.json({ error: "Team is full" }, { status: 409 });
  if (team.members.some((m) => m.userId === meId)) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const [member, me] = await prisma.$transaction([
    prisma.teamMember.create({
      data: { teamId: team.id, userId: meId, role: "MEMBER" },
      include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    }),
    prisma.user.findUnique({ where: { id: meId }, select: { name: true } }),
  ]);

  await createNotification({
    userId: team.leaderId,
    type: "TEAM_JOIN",
    title: "New team member",
    body: `${me?.name} joined "${team.name}"`,
    link: `/teams/${team.id}`,
  });
  emitToUser(team.leaderId, "team:update", { teamId: team.id });
  for (const m of team.members) emitToUser(m.userId, "team:update", { teamId: team.id });

  return NextResponse.json({ member }, { status: 201 });
}