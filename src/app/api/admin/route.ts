import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const [totalUsers, totalOrders, ingresos] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalOrders,
    ingresos: ingresos._sum.total ?? 0,
  });
}
