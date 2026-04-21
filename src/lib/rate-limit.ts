// Mitigación V3 (parcial, a nivel de aplicación): rate limiter in-memory
// por IP para el endpoint de login. Complementa el limit_req de Nginx.
// Almacena un contador por IP en una ventana deslizante simple de 60s.
// Al reiniciar el proceso el estado se pierde (suficiente para esta demo
// académica; en producción se usaría Redis o similar).

type RateLimitRecord = { count: number; lastReset: number };

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

const store = new Map<string, RateLimitRecord>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now - record.lastReset > WINDOW_MS) {
    store.set(ip, { count: 1, lastReset: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfter: 0 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil(
      (WINDOW_MS - (now - record.lastReset)) / 1000,
    );
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - record.count,
    retryAfter: 0,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
