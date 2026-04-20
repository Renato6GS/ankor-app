import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// V3 (INTENCIONAL): sin rate limiting ni contador de intentos.
// V7 (INTENCIONAL): no se registra ningún intento (éxito ni fallo).
// Sesión vulnerable: cookie en texto plano con userId y role, sin firma ni cifrado.
// Mitigación posterior: rate limit en middleware + iron-session + logging con Pino.
export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email y password son requeridos" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as "CUSTOMER" | "ADMIN";
  await session.save();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
