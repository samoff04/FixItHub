import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const participantRows = await prisma.conversationParticipant.findMany({
    where: { userId: meId },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, avatarUrl: true, isOnline: true } } },
          },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const conversations = await Promise.all(
    participantRows.map(async (row) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: row.conversationId,
          senderId: { not: meId },
          createdAt: { gt: row.lastReadAt ?? new Date(0) },
        },
      });
      return {
        ...row.conversation,
        lastMessage: row.conversation.messages[0] ?? null,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ conversations });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId, teamId } = await req.json();

  if (teamId) {
    const membership = await prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: meId } } });
    if (!membership) return NextResponse.json({ error: "Not a team member" }, { status: 403 });

    const existing = await prisma.conversation.findFirst({
      where: { isGroup: true, name: `team:${teamId}` },
    });
    if (existing) return NextResponse.json({ conversation: existing });

    const members = await prisma.teamMember.findMany({ where: { teamId } });
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name: `team:${teamId}`,
        participants: { create: members.map((m) => ({ userId: m.userId })) },
      },
      include: { participants: { include: { user: true } } },
    });
    return NextResponse.json({ conversation, displayName: team?.name }, { status: 201 });
  }

  if (!targetUserId) return NextResponse.json({ error: "targetUserId or teamId required" }, { status: 400 });
  if (targetUserId === meId) return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });

  const connected = await prisma.connection.findFirst({
    where: { OR: [{ userAId: meId, userBId: targetUserId }, { userAId: targetUserId, userBId: meId }] },
  });
  if (!connected) return NextResponse.json({ error: "You must be connected to message this user" }, { status: 403 });

  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [{ participants: { some: { userId: meId } } }, { participants: { some: { userId: targetUserId } } }],
    },
    include: { participants: { include: { user: true } } },
  });
  if (existing) return NextResponse.json({ conversation: existing });

  const conversation = await prisma.conversation.create({
    data: { isGroup: false, participants: { create: [{ userId: meId }, { userId: targetUserId }] } },
    include: { participants: { include: { user: true } } },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}