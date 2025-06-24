import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'de'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // We can't use the headers from the request directly, as they might be cached.
  // Instead, we create a new Headers object.
  const headers = new Headers(request.headers);
  const acceptLanguage = headers.get("accept-language");

  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0]);
    for (const lang of languages) {
        const cleanedLang = lang.trim().split('-')[0];
        if (locales.includes(cleanedLang)) {
            return cleanedLang;
        }
    }
  }
  
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The matcher in `config` already filters out /_next, /api, etc.
  // This additional check handles files in the public directory like .md, .pdf, .png etc.
  // by checking for a dot in the path. If one is found, we assume it's a static file
  // and don't apply i18n routing.
  if (pathname.includes('.')) {
    return;
  }

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  // Redirect to the same path with a locale prefix
  const locale = getLocale(request);
  
  // For the default locale 'en', we will also use a prefix for consistency
  // e.g. /dashboard -> /en/dashboard
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static assets
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};
