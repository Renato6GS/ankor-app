import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "../../../lib/db";
import logger from "@/lib/logger";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  logger.info({ adminId: auth.userId, endpoint: "/api/users" }, "Acceso API");

  return NextResponse.json(users);
}
