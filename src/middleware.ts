import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIES_USER_ACCESS_TOKEN } from './context/actionTypes';
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  console.log('middleware called');
  let isAuth = request.cookies.has(COOKIES_USER_ACCESS_TOKEN)
  if (request.nextUrl.pathname.startsWith('/')) {
    if (!isAuth) {
      url.pathname = '/auth/signin'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/profile/:path*', '/contest/:path']
}