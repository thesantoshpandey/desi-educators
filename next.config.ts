import type { NextConfig } from "next";

// Force Vercel Re-deployment: 2026-03-01T23:00:00
const nextConfig: any = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/sb-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`,
      },
    ];
  },

  async headers() {
    const headers = [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          }
        ]
      }
    ];

    if (process.env.NODE_ENV === 'production') {
      headers[0].headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      });
    }

    return headers;
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
