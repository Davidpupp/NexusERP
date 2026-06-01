import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 * - script-src allows 'unsafe-inline' because Next.js App Router injects an inline
 *   bootstrap/hydration script. Nonce-based CSP is the stricter upgrade but forces
 *   dynamic rendering on every route; we keep static optimization here.
 * - Mercado Pago domains are allowed for the checkout SDK / Pix flow.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://sdk.mercadopago.com https://*.mercadopago.com https://cdn.pluggy.ai`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com https://api.pluggy.ai https://api.anthropic.com",
  "frame-src 'self' https://*.mercadopago.com https://*.pluggy.ai https://connect.pluggy.ai",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Strip console.* in production except errors/warnings.
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
