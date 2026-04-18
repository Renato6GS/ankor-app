# V9 (INTENCIONAL): imagen Docker sin optimizar y sin escanear.
# - Base "node:20" sin versión minor/patch fijada y sin variante alpine/slim
#   (~1 GB, mucha superficie de ataque y CVEs heredados de Debian).
# - Sin multi-stage build: el contenedor final incluye toolchain, devDeps y
#   código fuente que no se necesitan en runtime.
# - Sin usuario no-root: el proceso corre como root dentro del contenedor.
# - Sin escaneo de CVEs (Trivy se aplicará en la fase de mitigación).
# Mitigación posterior: node:20.XX.X-alpine fijo + multi-stage + USER node + Trivy.

FROM node:20

WORKDIR /app

COPY . .

# Buena práctica:
# RUN npm install -g pnpm && pnpm install

# Mala práctica:
RUN npm install -g pnpm && CI=true pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
