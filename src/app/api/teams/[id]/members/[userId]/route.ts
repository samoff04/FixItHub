import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { emitToUser } from "@/lib/socket-server";
import { createNotification } from "@/lib/notifications";

export async function DELETE(_req: Request, { params }: { params: { id: string; userId: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.team.findUnique({ where: { id: params.id }, include: { members: true } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isSelfLeave = params.userId === meId;
  const isLeaderRemoving = team.leaderId === meId;
  if (!isSelfLeave && !isLeaderRemoving) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (params.userId === team.leaderId) return NextResponse.json({ error: "Leader cannot be removed" }, { status: 400 });

  await prisma.teamMember.delete({ where: { teamId_userId: { teamId: team.id, userId: params.userId } } });

  if (isLeaderRemoving && !isSelfLeave) {
    await createNotification({
      userId: params.userId,
      type: "TEAM_REMOVED",
      title: "Removed from team",
      body: `You were removed from "${team.name}"`,
      link: `/teams`,
    });
  }
  for (const m of team.members) emitToUser(m.userId, "team:update", { teamId: team.id });

  return NextResponse.json({ success: true });
}