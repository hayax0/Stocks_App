import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = path === "/sign-in" || path === "/sign-up";

    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!isPublicRoute && !sessionCookie) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (isPublicRoute && sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};