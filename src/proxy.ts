import { NextRequest, NextResponse } from "next/server";
import { auth as adminAuth } from "@/lib/firebase/admin";
import { isAuthorizedCrmRole, SESSION_COOKIE_NAME } from "@/lib/auth/session";

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  if (!request.nextUrl.pathname.startsWith("/api/")) {
    const returnUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("returnUrl", returnUrl);
  }

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isProtectedAppRoute = pathname.startsWith("/app") || pathname.startsWith("/sales");
  const isProtectedApiRoute = pathname.startsWith("/api/crm");
  const isLoginRoute = pathname === "/login";


  if (!sessionCookie) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
    }

    if (isProtectedAppRoute) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  }

  try {
    const decodedSession = await adminAuth.verifySessionCookie(sessionCookie, true);
    const role = typeof decodedSession.role === "string" ? decodedSession.role : null;

    if (!isAuthorizedCrmRole(role)) {
      if (isProtectedApiRoute) {
        return NextResponse.json({ ok: false, error: "You do not have CRM access." }, { status: 403 });
      }

      if (isProtectedAppRoute) {
        const deniedUrl = new URL("/login", request.url);
        deniedUrl.searchParams.set("denied", "1");
        return NextResponse.redirect(deniedUrl);
      }
    }

    if (isLoginRoute) {
      return NextResponse.redirect(new URL("/app/leads", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("CRM proxy session verification failed:", error);

    if (isProtectedApiRoute) {
      const response = NextResponse.json({ ok: false, error: "Your session has expired." }, { status: 401 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    if (isProtectedAppRoute || isLoginRoute) {
      const response = redirectToLogin(request);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/app/:path*", "/sales/:path*", "/api/crm/:path*", "/login"],
};

