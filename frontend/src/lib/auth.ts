import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode"; 
import { User } from "@/types/api";

const apiClient = {
    post: async (url: string, data: any) => {
      const response = await fetch(`http://localhost:8080${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Authentication failed');
      }
      return response.text();
    },
};

interface DecodedToken {
  sub: string;
  name: string;
  role: User['role'];
  iat: number;
  exp: number;
}


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
          const token = await apiClient.post('/api/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          if (token) {
            const decoded = jwtDecode<DecodedToken>(token);
            
            const user = {
              id: decoded.sub,
              name: decoded.name,
              email: credentials.email,
              role: decoded.role,
              accessToken: token,
            };
            
            return user;
          }
          return null;
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
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};