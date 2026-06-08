import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Allow login page and public assets without auth check
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // Run i18n middleware
  const response = intlMiddleware(request);

  // Auth guard: redirect to login if no refreshToken cookie
  // (Skip for login page itself)
  const locale = pathname.split('/')[1];
  const isLoginPage = pathname === `/${locale}/login` || pathname === '/login';

  if (!isLoginPage) {
    const hasRefreshToken = request.cookies.get('refreshToken')?.value;
    if (!hasRefreshToken) {
      const loginUrl = new URL(`/${locale || routing.defaultLocale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
