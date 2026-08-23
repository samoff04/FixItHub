import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validations";
import { emitToConversation, emitToUser } from "@/lib/socket-server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: meId } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: params.id, userId: meId } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ messages: messages.reverse(), nextCursor: messages.length === 30 ? messages[0]?.id : null });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: meId } },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: params.id, senderId: meId, content: parsed.data.content },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.conversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } }),
  ]);

  emitToConversation(params.id, "message:new", message);

  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId: params.id, userId: { not: meId } },
  });
  for (const p of otherParticipants) {
    emitToUser(p.userId, "conversation:updated", { conversationId: params.id, message });
  }

  return NextResponse.json({ message }, { status: 201 });
}