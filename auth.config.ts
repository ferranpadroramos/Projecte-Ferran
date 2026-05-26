import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Configuració bàsica sense Prisma (compatible amb Edge Runtime)
export const authConfig: NextAuthConfig = {
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: '/login' },
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        session({ session, token }) {
            session.user.id = token.id as string
            return session
        }
    },
    providers: [
        Credentials({
            credentials: { email: {}, password: {} },
            authorize: () => null // la lògica real és a auth.ts
        })
    ]
}
