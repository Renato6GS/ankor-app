// V8 (INTENCIONAL): sin headers de seguridad.
// La app NO declara async headers() aquí, por lo que no envía:
//   - Content-Security-Policy (CSP)
//   - Strict-Transport-Security (HSTS)
//   - X-Frame-Options (clickjacking)
//   - X-Content-Type-Options (MIME sniffing)
//   - Referrer-Policy / Permissions-Policy
// Mitigación posterior: Luis Castillo configura estos headers en Nginx
// (reverse proxy) en lugar de hacerlo aquí, junto con TLS (V1).
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
