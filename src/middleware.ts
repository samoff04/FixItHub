export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/discover/:path*",
    "/teams/:path*",
    "/events/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};