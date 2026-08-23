import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { connectionRequestSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [incoming, outgoing, connections] = await Promise.all([
    prisma.connectionRequest.findMany({
      where: { receiverId: meId, status: "PENDING" },
      include: { sender: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connectionRequest.findMany({
      where: { senderId: meId, status: "PENDING" },
      include: { receiver: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.connection.findMany({
      where: { OR: [{ userAId: meId }, { userBId: meId }] },
      include: {
        userA: { select: { id: true, name: true, username: true, avatarUrl: true, isOnline: true } },
        userB: { select: { id: true, name: true, username: true, avatarUrl: true, isOnline: true } },
      },
    }),
  ]);

  const connectionUsers = connections.map((c) => (c.userAId === meId ? c.userB : c.userA));

  return NextResponse.json({ incoming, outgoing, connections: connectionUsers });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = connectionRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { receiverId, message } = parsed.data;

  if (receiverId === meId) return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });

  const existingConnection = await prisma.connection.findFirst({
    where: { OR: [{ userAId: meId, userBId: receiverId }, { userAId: receiverId, userBId: meId }] },
  });
  if (existingConnection) return NextResponse.json({ error: "Already connected" }, { status: 409 });

  try {
    const request = await prisma.connectionRequest.create({
      data: { senderId: meId, receiverId, message },
      include: { sender: { select: { id: true, name: true, username: true, avatarUrl: true } } },
    });

    const sender = await prisma.user.findUnique({ where: { id: meId }, select: { name: true } });
    await createNotification({
      userId: receiverId,
      type: "CONNECTION_REQUEST",
      title: "New connection request",
      body: `${sender?.name} wants to connect with you`,
      link: `/discover`,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Request already sent" }, { status: 409 });
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}