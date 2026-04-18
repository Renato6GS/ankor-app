import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

// V6 (INTENCIONAL): endpoint "admin" sin validación de sesión ni rol.
// Cualquiera puede consultar estadísticas internas del negocio.
// Mitigación posterior: middleware que verifique session.role === "ADMIN".
export async function GET() {
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
