// V6/V8 (INTENCIONAL): la sesión se lee en cliente parseando una cookie en
// texto plano. Sin httpOnly, sin firma. Cualquier script puede leer/forjar
// la sesión modificando document.cookie.
// Mitigación posterior: iron-session + cookies httpOnly + lectura server-side.
export type Session = { userId: number; role: "CUSTOMER" | "ADMIN" } | null;

export function getClientSession(): Session {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("session="));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return null;
  }
}
