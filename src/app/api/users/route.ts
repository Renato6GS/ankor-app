import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

// V6 (INTENCIONAL): expone TODOS los usuarios con datos personales sin auth.
// Cualquier visitante puede listar emails, nombres, direcciones y teléfonos.
// Mitigación posterior: requerir sesión + rol ADMIN, y nunca exponer password hash.
export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      address: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}
