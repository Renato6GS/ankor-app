# Instalar dependencias:

pnpm install

Aprobar postscripts:

pnpm approve-builds


## Levantar docker compose:

docker compose up -d db

Resultado:

ankor-app on  main [✘!?⇡] via  v24.10.0 took 4s
❯ docker compose up -d db
[+] up 18/18
 ✔ Image postgres:16         Pulled                                                                                            10.5s
 ✔ Network ankor-app_default Created                                                                                           0.0s
 ✔ Volume ankor-app_pgdata   Created                                                                                           0.0s
 ✔ Container ankor-app-db-1  Started 


## Crear DB y seeds:

- pnpm prisma generate

---
ankor-app on  main [✘!?⇡] via  v24.10.0
❯ pnpm prisma generate
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.

✔ Generated Prisma Client (v7.7.0) to ./node_modules/.pnpm/@prisma+client@7.7.0_prisma@7.7.0_@types+react-dom@19.2.1_@types+react@19.2.14__@types+_e5afccb7cfcb889671674b6db1f25784/node_modules/@prisma/client in 85ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
---

- pnpm prisma db push

---
ankor-app on  main [✘!?⇡] via  v24.10.0
❯ pnpm prisma db push
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
Datasource "db": PostgreSQL database "ankor", schema "public" at "localhost:5432"

🚀  Your database is now in sync with your Prisma schema. Done in 175ms
---

- pnpm prisma db seed