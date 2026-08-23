import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notification = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notification || notification.userId !== meId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.notification.update({ where: { id: params.id }, data: { isRead: true } });
  return NextResponse.json({ notification: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notification = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notification || notification.userId !== meId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.notification.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}