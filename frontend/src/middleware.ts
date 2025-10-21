import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server";

export default withAuth(
    async function middleware(req) {
        const token = await getToken({req});
        const isAuthenticated = !!token;

        const { pathname } = req.nextUrl;

        if (isAuthenticated) {
            const userRole = token?.role;

            if (pathname.startsWith("/schedule") && userRole !== "DOCTOR") {
                return NextResponse.redirect(new URL("/appointments", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        }
    }
)

export const config = {
    matcher: [
        "/appointments",
        "/records",
        "/find-doctor",
        "/schedule"
    ]
}