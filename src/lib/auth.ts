import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type SessionData = {
  userId: number;
  role: "CUSTOMER" | "ADMIN";
};

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAuth(): Promise<SessionData | NextResponse> {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return { userId: session.userId, role: session.role };
}

export async function requireAdmin(): Promise<SessionData | NextResponse> {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }
  return { userId: session.userId, role: session.role };
}
