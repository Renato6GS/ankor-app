# PASO 1.7 — Verificación de ausencia de logging (V7)

**Responsable:** Andrea Garrido
**Vulnerabilidad:** V7 — Sin logging
**Fecha de verificación (estado vulnerable):** 2026-04-17

## Objetivo

Confirmar que la app, en su estado vulnerable, no registra accesos, errores ni acciones administrativas en ningún formato estructurado. Esto deja al equipo sin trazabilidad ante incidentes (ataques de fuerza bruta, accesos indebidos al panel admin, fugas de datos).

## Evidencia del estado actual

### 1. Sin librerías de logging instaladas

```bash
pnpm list pino winston bunyan
# → No matching package found
```

### 2. Sin invocaciones a `console.*`, `pino`, `winston` ni helper `logger` en `src/`

```bash
grep -rn "console\.\|pino\|winston\|logger" src/
# → sin resultados
```

### 3. Logs del contenedor durante un ataque de fuerza bruta

```bash
docker compose logs app
# → Solo aparece la salida estándar de Next.js (rutas compiladas, requests HTTP).
#   Ningún registro de:
#     - intentos fallidos de /api/auth/login
#     - accesos a /admin sin sesión
#     - lecturas de /api/users por anónimos
```

## Puntos del código donde DEBE existir logging (mitigación)

Cada fila representa un evento crítico hoy invisible. En la fase de mitigación, Andrea Garrido implementará Pino y agregará llamadas en estos puntos.

| Archivo | Evento que NO se registra hoy | Nivel | Campos clave |
|---|---|---|---|
| `src/app/api/auth/login/route.ts` | Intento de login (éxito y fallo) | `info` / `warn` | `email`, `ip`, `userAgent`, `success` |
| `src/app/api/auth/register/route.ts` | Alta de usuario | `info` | `userId`, `email`, `ip` |
| `src/app/api/auth/logout/route.ts` | Cierre de sesión | `info` | `userId`, `ip` |
| `src/app/api/admin/route.ts` | Acceso al panel admin | `warn` | `userId`, `role`, `ip`, `path` |
| `src/app/api/users/route.ts` | Lectura de datos sensibles | `warn` | `userId`, `ip`, `count` |
| `src/app/api/orders/route.ts` | Creación de pedido | `info` | `orderId`, `userId`, `total` |
| `src/lib/db.ts` | Errores de conexión / queries | `error` | `code`, `message`, `query` (sin PII) |
| `src/middleware.ts` (futuro) | Cada request entrante | `info` | `method`, `path`, `ip`, `status`, `durationMs` |

## Plan de mitigación (resumen para Fase 3)

1. `pnpm add pino pino-pretty`
2. Crear `src/lib/logger.ts` exportando una instancia única de Pino con redacción de campos sensibles (`password`, `cookies.session`).
3. Insertar llamadas `logger.info(...)` / `logger.warn(...)` / `logger.error(...)` en cada punto de la tabla anterior.
4. En el middleware de Next.js, registrar cada request con `method`, `path`, `ip` y `status`.
5. En producción, redirigir stdout del contenedor a un colector (Loki, CloudWatch, etc.); por ahora basta con `docker compose logs app`.

## Capturas para el entregable

- `docs/evidencias/v7-antes-pnpm-list.png` — salida de `pnpm list pino winston bunyan`.
- `docs/evidencias/v7-antes-grep.png` — salida del `grep` sin resultados.
- `docs/evidencias/v7-antes-bruteforce-logs.png` — `docker compose logs app` durante un ataque de fuerza bruta sin trazas.

## Conclusión

El estado vulnerable está confirmado: la app no produce ninguna traza auditable. Ante un incidente real, no habría forma de reconstruir qué pasó, quién lo hizo ni cuándo. La mitigación con Pino se aplica en la Fase 3.
