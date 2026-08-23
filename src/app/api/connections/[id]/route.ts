import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const request = await prisma.connectionRequest.findUnique({ where: { id: params.id } });
  if (!request || request.receiverId !== meId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Request already handled" }, { status: 409 });
  }

  if (action === "decline") {
    await prisma.connectionRequest.update({
      where: { id: params.id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    return NextResponse.json({ status: "DECLINED" });
  }

  const [updated, receiver] = await prisma.$transaction([
    prisma.connectionRequest.update({
      where: { id: params.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
    prisma.user.findUnique({ where: { id: meId }, select: { name: true } }),
    prisma.connection.create({ data: { userAId: request.senderId, userBId: request.receiverId } }),
  ]);

  await createNotification({
    userId: request.senderId,
    type: "CONNECTION_ACCEPTED",
    title: "Connection accepted",
    body: `${receiver?.name} accepted your connection request`,
    link: `/profile/${meId}`,
  });

  return NextResponse.json({ status: "ACCEPTED" });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.connectionRequest.findUnique({ where: { id: params.id } });
  if (!request || request.senderId !== meId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.connectionRequest.update({ where: { id: params.id }, data: { status: "CANCELED" } });
  return NextResponse.json({ status: "CANCELED" });
}