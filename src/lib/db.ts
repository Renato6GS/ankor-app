// V5 (INTENCIONAL): secreto hardcodeado en código fuente.
// Las credenciales de la base de datos quedan expuestas al compartir el repo.
// Mitigación posterior: leer desde process.env.DATABASE_URL / Docker secrets.
import { PrismaClient } from "@generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = "postgresql://ankor:ankor123@db:5432/ankor";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
