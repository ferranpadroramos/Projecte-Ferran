import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const auth = NextAuth({
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
        CredentialsProvider({
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) return null
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if(!user) return null

                const valid = await bcrypt.compare(credentials.password as string, user.password)
                if(!valid) return null

                return { id: String(user.id), email: user.email, name: user.username }
            }
        })
    ]
})

export const { GET, POST} = auth