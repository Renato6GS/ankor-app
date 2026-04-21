import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import logger from "@/lib/logger";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    logger.warn({ ip, retryAfter: rate.retryAfter }, "Rate limit excedido en login");
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo en unos segundos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfter),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "email y password son requeridos" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logger.warn({ email, ip }, "Login fallido: usuario no encontrado");
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    logger.warn({ email, ip }, "Login fallido: password incorrecto");
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as "CUSTOMER" | "ADMIN";
  await session.save();

  logger.info({ userId: user.id, email: user.email }, "Login exitoso");

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
