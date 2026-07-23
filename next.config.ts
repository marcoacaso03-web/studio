import type { NextConfig } from 'next';
import nextPwa from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = nextPwa({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Genkit / OpenTelemetry pull in optional exporters (jaeger, zipkin, etc.)
  // that are never used at runtime. Keep them external on the server so Next
  // doesn't try to bundle them, and ignore them in the client/build graph to
  // silence "Can't resolve '@opentelemetry/exporter-jaeger'" warnings.
  serverExternalPackages: ['@opentelemetry/sdk-node', 'genkit', '@genkit-ai/core'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'embla-carousel-react'],
  },
  webpack: (config, { isServer }) => {
    // These OpenTelemetry exporters are optional peer deps of @opentelemetry/sdk-node
    // and are not installed. Alias them to false so webpack treats them as empty
    // modules instead of failing to resolve them.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@opentelemetry/exporter-jaeger': false,
      '@opentelemetry/exporter-zipkin': false,
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@opentelemetry/exporter-jaeger': false,
      };
    }
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default withAnalyzer(withPWA(nextConfig));