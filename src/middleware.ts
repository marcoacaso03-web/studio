import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Lightweight preventive guard for server-side routes.
 *
 * NOTE: app auth is client-side (onAuthStateChanged, no server session cookie),
 * so this middleware CANNOT verify the user identity on pages. Its only safe
 * job is a cheap pre-check on privileged API routes: reject requests that don't
 * even carry an Authorization header before they reach the handler. The real
 * token verification (role === 'developer', idToken) stays inside each route
 * (see src/app/api/admin/set-role/route.ts).
 *
 * If you later adopt Firebase session cookies, this is where you'd verify the
 * session and gate protected pages (e.g. /director).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/admin/')) {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
