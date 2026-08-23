import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const skillsFilter = searchParams.get("skills")?.split(",").filter(Boolean) ?? [];
  const rolesFilter = searchParams.get("roles")?.split(",").filter(Boolean) ?? [];
  const goalsFilter = searchParams.get("goals")?.split(",").filter(Boolean) ?? [];
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = 12;

  const me = await prisma.user.findUnique({ where: { id: meId }, include: { skills: true } });
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [connections, outgoingPending] = await Promise.all([
    prisma.connection.findMany({ where: { OR: [{ userAId: meId }, { userBId: meId }] } }),
    prisma.connectionRequest.findMany({ where: { senderId: meId, status: "PENDING" } }),
  ]);
  const connectedIds = new Set(connections.flatMap((c) => [c.userAId, c.userBId]).filter((id) => id !== meId));
  const pendingSentIds = new Set(outgoingPending.map((r) => r.receiverId));

  const candidates = await prisma.user.findMany({
    where: {
      id: { not: meId },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
              { bio: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(skillsFilter.length ? { skills: { some: { skill: { name: { in: skillsFilter } } } } } : {}),
      ...(rolesFilter.length ? { roles: { hasSome: rolesFilter } } : {}),
      ...(goalsFilter.length ? { goals: { hasSome: goalsFilter } } : {}),
      settings: { profileVisibility: { not: "private" } },
    },
    include: { skills: { include: { skill: true } } },
    take: 200,
  });

  const scored = candidates
    .map((c) => ({
      ...c,
      matchScore: computeMatchScore(
        { skills: me.skills, roles: me.roles, goals: me.goals },
        { skills: c.skills, roles: c.roles, goals: c.goals }
      ),
      connectionStatus: connectedIds.has(c.id) ? "connected" : pendingSentIds.has(c.id) ? "pending_sent" : "none",
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const total = scored.length;
  const paged = scored.slice((page - 1) * pageSize, page * pageSize).map(({ passwordHash, ...u }: any) => u);

  return NextResponse.json({ users: paged, total, page, pageSize });
}