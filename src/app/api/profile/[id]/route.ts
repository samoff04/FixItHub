import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validations";

async function resolveId(id: string, sessionUserId?: string) {
  if (id === "me") {
    if (!sessionUserId) return null;
    return sessionUserId;
  }
  return id;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const targetId = await resolveId(params.id, (session?.user as any)?.id);
  if (!targetId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    include: {
      skills: { include: { skill: true } },
      settings: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isSelf = (session?.user as any)?.id === user.id;
  if (!isSelf && user.settings?.profileVisibility === "private") {
    return NextResponse.json({ error: "This profile is private" }, { status: 403 });
  }

  let connectionStatus: "none" | "pending_sent" | "pending_received" | "connected" = "none";
  if (session && !isSelf) {
    const meId = (session.user as any).id;
    const connection = await prisma.connection.findFirst({
      where: { OR: [{ userAId: meId, userBId: user.id }, { userAId: user.id, userBId: meId }] },
    });
    if (connection) connectionStatus = "connected";
    else {
      const sent = await prisma.connectionRequest.findFirst({
        where: { senderId: meId, receiverId: user.id, status: "PENDING" },
      });
      const received = await prisma.connectionRequest.findFirst({
        where: { senderId: user.id, receiverId: meId, status: "PENDING" },
      });
      if (sent) connectionStatus = "pending_sent";
      else if (received) connectionStatus = "pending_received";
    }
  }

  const { passwordHash, ...safe } = user;
  return NextResponse.json({ user: { ...safe, connectionStatus, isSelf } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (params.id !== "me" && params.id !== meId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { skills, ...rest } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id: meId }, data: rest });

    if (skills) {
      await tx.userSkill.deleteMany({ where: { userId: meId } });
      for (const s of skills) {
        const skill = await tx.skill.upsert({
          where: { name: s.name },
          update: {},
          create: { name: s.name },
        });
        await tx.userSkill.create({ data: { userId: meId, skillId: skill.id, level: s.level } });
      }
    }

    return tx.user.findUnique({ where: { id: meId }, include: { skills: { include: { skill: true } } } });
  });

  const { passwordHash, ...safe } = updated!;
  return NextResponse.json({ user: safe });
}