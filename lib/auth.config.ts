import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = pathname.startsWith("/admin");
      const isAuthRoute =
        pathname.startsWith("/login") || pathname.startsWith("/register");

      if (isAdminRoute) {
        const role = auth?.user?.role;
        return (
          isLoggedIn &&
          (role === "ADMIN" || role === "EDITOR" || role === "AUTHOR")
        );
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
