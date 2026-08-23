import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reportSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reports = await prisma.report.findMany({
    include: {
      reportedBy: { select: { id: true, name: true, username: true } },
      reportedUser: { select: { id: true, name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const meId = (session?.user as any)?.id;
  if (!meId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.reportedUserId === meId) return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });

  const report = await prisma.report.create({ data: { ...parsed.data, reportedById: meId } });
  return NextResponse.json({ report }, { status: 201 });
}