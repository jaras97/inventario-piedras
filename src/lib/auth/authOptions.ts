import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/db/prisma"
import { compare } from "bcryptjs"
import type { NextAuthOptions, SessionStrategy } from "next-auth"
import GoogleProvider from "next-auth/providers/google"



export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        return user
      }
    }),
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge:100*100
  },
  callbacks: {
    async signIn({ user }) {
        if (!user.email) return false
      
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        })
      
        // 🆕 Si no existe en DB, dejar que NextAuth lo cree
        if (!dbUser) {
          return true
        }
      
        // 🚫 Si existe y no está autorizado → denegado
        if (!dbUser.isAuthorized) {
          return false
        }
      
        return true
      },
  
      async session({ session, token }) {
        session.user.id = token.sub as string
        session.user.isAuthorized = token.isAuthorized as boolean
        session.user.role = token.role as string;
        return session
      },
      async jwt({ token }) {
        if (!token?.sub) return token
      
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        })
      
        if (dbUser) {
          token.isAuthorized = dbUser.isAuthorized
          token.role = dbUser.role;
        }
      
        return token
      }
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
}