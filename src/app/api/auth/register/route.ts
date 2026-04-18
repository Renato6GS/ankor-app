import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@generated/prisma/enums";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password y name son requeridos" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "El email ya está registrado" },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      role: Role.CUSTOMER,
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    { status: 201 },
  );
}
