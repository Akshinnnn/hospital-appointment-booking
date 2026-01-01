import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          const apiUrl = process.env.API_URL || 'http://userservice:8080';
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            console.error("Login response not OK:", response.status, response.statusText);
            return null;
          }

          const data = await response.json();
          console.log("Login response data:", data);

          // Backend returns ApiResponse<string> with structure: { success: true, data: "token", message: "..." }
          // Try both camelCase and PascalCase
          const token = data.data || data.Data;

          if (!token) {
            console.error("No token in response:", data);
            return null;
          }

          const decoded: any = jwtDecode(token);

          console.log("DECODED TOKEN FROM BACKEND:", decoded);

          const user = {
            id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: credentials.email,
            role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            accessToken: token,
          };
          console.log("CORRECTLY MAPPED USER OBJECT:", user);

          return user;
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      
      // Handle session update (when update() is called)
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = token.name;
        (session.user as any).role = token.role;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
};