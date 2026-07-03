declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    fallbacks?: Record<string, string>;
    scope?: string;
    sw?: string;
    runtimeCaching?: object[];
    buildExcludes?: (string | RegExp)[];
    publicExcludes?: string[];
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    subdomainPrefix?: string;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export = withPWA;
}
