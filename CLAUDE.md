# CLAUDE.md — Proyecto ANKOR (Auditoría de Seguridad)

## Descripción del Proyecto

ANKOR es una tienda e-commerce ficticia de moda femenina (B2C) construida intencionalmente con vulnerabilidades de seguridad. El objetivo es demostrar un ciclo completo de auditoría: estado vulnerable → identificación → mitigación → validación.

## Stack Tecnológico

- **Framework**: Next.js 16.2.4 (App Router)
- **UI**: Mantine UI 9.0.2
- **Package Manager**: pnpm
- **Base de datos**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Contenedores**: Docker + Docker Compose
- **Servidor**: Linux Ubuntu

## Estructura del Proyecto

```
ankor/
├── CLAUDE.md
├── docker-compose.yml          # PostgreSQL + app
├── Dockerfile                  # Imagen de la app
├── .env.example                # Template de variables de entorno
├── nginx/                      # Configuración Nginx (Fase de mitigación)
│   └── default.conf
├── prisma/
│   └── schema.prisma           # Modelos: User, Product, Order, Category
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx            # Landing / catálogo
│       ├── login/
│       │   └── page.tsx        # Login de usuarios
│       ├── admin/
│       │   └── page.tsx        # Panel admin (gestión productos/pedidos)
│       ├── cart/
│       │   └── page.tsx        # Carrito de compras
│       ├── profile/
│       │   └── page.tsx        # Perfil de usuario
│       └── api/
│           ├── auth/
│           │   ├── login/route.ts
│           │   ├── logout/route.ts
│           │   └── register/route.ts
│           ├── products/
│           │   └── route.ts    # CRUD productos
│           ├── orders/
│           │   └── route.ts    # Consulta de pedidos
│           ├── users/
│           │   └── route.ts    # Datos de usuarios
│           └── admin/
│               └── route.ts    # Endpoints admin
├── src/
│   ├── lib/
│   │   ├── db.ts               # Cliente Prisma
│   │   ├── auth.ts             # Helpers de sesión (iron-session en fase mitigación)
│   │   └── logger.ts           # Logger (PinoJS en fase mitigación)
│   └── middleware.ts           # Middleware Next.js
└── docs/
    ├── PASO_A_PASO.txt
    └── evidencias/             # Capturas antes/después
```

## Comandos Principales

```bash
pnpm install                    # Instalar dependencias
pnpm dev                        # Dev server (puerto 3000)
pnpm build                      # Build producción
pnpm start                      # Iniciar producción
docker compose up -d            # Levantar PostgreSQL + app
npx prisma generate             # Generar cliente Prisma
npx prisma db push              # Sincronizar schema con DB
npx prisma db seed              # Seed data
```

## Modelos de Datos (Prisma)

### User
- id, email, password (hash con bcrypt), name, role (CUSTOMER | ADMIN), address, phone, createdAt

### Product
- id, name, description, price, image, stock, categoryId, createdAt

### Category
- id, name, slug

### Order
- id, userId, total, status (PENDING | CONFIRMED | SHIPPED | DELIVERED), createdAt

### OrderItem
- id, orderId, productId, quantity, price

## Vulnerabilidades Intencionales (Estado Inicial)

La app se construye PRIMERO con estas 9 vulnerabilidades presentes. Cada una se documenta con evidencia.

| ID | Vulnerabilidad | Cómo se manifiesta en el código |
|----|---------------|-------------------------------|
| V1 | Sin HTTPS | App servida solo en HTTP, sin TLS |
| V2 | Puerto 3000 expuesto | Sin reverse proxy, Next.js directo |
| V3 | Sin rate limiting en login | Endpoint `/api/auth/login` sin límite de intentos |
| V4 | Sin VPN de acceso | Panel `/admin` accesible desde cualquier IP |
| V5 | Secretos en código fuente | DATABASE_URL y API keys hardcodeados en archivos .ts |
| V6 | APIs sin autenticación | `/api/users`, `/api/orders` no validan sesión |
| V7 | Sin logging | Sin registro de acciones ni errores |
| V8 | Sin headers de seguridad | Sin CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| V9 | Imagen Docker sin escanear | Dockerfile con base image genérica sin análisis de CVEs |

## Reglas para el Código Vulnerable

Cuando generes el estado vulnerable:
- **V5**: Escribe el DATABASE_URL directamente en `db.ts` como string literal. Ejemplo: `const DATABASE_URL = "postgresql://ankor:ankor123@localhost:5432/ankor"`
- **V6**: Los endpoints GET de `/api/products`, `/api/users`, `/api/orders` NO deben verificar autenticación
- **V3**: El endpoint `/api/auth/login` debe hacer la consulta y comparar password sin ningún contador ni delay
- **V7**: No uses console.log estructurado ni ninguna librería de logging
- **V8**: No configures headers en `next.config.js` ni en middleware
- **V9**: Usa `FROM node:20` (sin versión minor fija, sin alpine, sin escaneo)

## Mitigaciones por Responsable

### Luis Castillo — V1, V2, V8, V3 parcial (Nginx)
- Configurar Nginx como reverse proxy (puerto 443 → 3000 interno)
- Certbot / Let's Encrypt para TLS (o certificado autofirmado para demo)
- Headers de seguridad en Nginx: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- `limit_req` en Nginx para rate limiting a nivel de red

### Renato Granados — V3 parcial (app), V4, V9
- Middleware de rate limiting en Next.js (in-memory counter por IP en `/api/auth/login`)
- Configuración de WireGuard VPN para acceso al panel admin
- Escaneo con Trivy de la imagen Docker. Migrar a `node:20-alpine` y fijar versión

### Andrea Garrido — V5, V6, V7
- Migrar secretos a `.env` y Docker secrets. Eliminar hardcoded values
- Implementar autenticación con `iron-session` en endpoints protegidos
- Implementar logging con PinoJS (accesos, errores, acciones de admin)

## Convenciones de Código

- Usar TypeScript estricto
- Componentes funcionales con hooks
- Archivos de API usan Route Handlers de Next.js App Router (`route.ts`). No usar las Next.js actions
- Mantine para todos los componentes UI (no instalar otras librerías UI)
- Nombres de archivos en kebab-case, componentes en PascalCase
- Commits semánticos: `feat:`, `fix:`, `security:`, `docs:`

## Alcance Funcional (Mínimo)

La app NO necesita ser un e-commerce completo. Necesita lo suficiente para demostrar las vulnerabilidades:

1. **Landing/Catálogo**: Listado de productos con imagen, nombre, precio
2. **Login/Register**: Formulario funcional con autenticación básica (email + password)
3. **Carrito**: Agregar productos, ver resumen (puede ser estado local, no necesita persistencia avanzada)
4. **Perfil**: Ver datos del usuario logueado y su historial de pedidos
5. **Panel Admin**: Vista protegida para ver usuarios, productos y pedidos (CRUD básico de productos)
6. **API Routes**: Endpoints REST para auth, products, orders, users, admin

## Seed Data

Crear un seed con:
- 2 usuarios (1 admin, 1 customer)
- 3 categorías (Vestidos, Accesorios, Calzado)
- 6-8 productos con imágenes placeholder (usar URLs de picsum.photos o similar)
- 2-3 pedidos de ejemplo

## Docker Compose (Estado Vulnerable)

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ankor
      POSTGRES_PASSWORD: ankor123
      POSTGRES_DB: ankor
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"      # Expuesto directamente (V2)
    depends_on:
      - db

volumes:
  pgdata:
```

## Notas Importantes

- Este es un proyecto ACADÉMICO para la Maestría en Informática de la Universidad Mariano Gálvez
- La empresa ANKOR es FICTICIA
- Las vulnerabilidades son INTENCIONALES para demostrar el ciclo de auditoría
- El entregable final requiere capturas de pantalla del antes/después de cada mitigación
- Se usan 6 herramientas externas: Nginx, Certbot, WireGuard, OWASP ZAP, Nmap, Trivy