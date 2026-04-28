import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    // Pàgina de login personalitzada
    pages: {
        signIn: '/login'
    },
    callbacks: {
        // Guardar l'id de l'usuari al token JWT
        jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        // Exposar l'id a la sessió
        session({ session, token }) {
            session.user.id = token.id as string
            return session
        }
    },
    providers: [
        Credentials({
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                // Validar que no falten camps
                if (!credentials?.email || !credentials?.password) return null

                // Buscar l'usuari per email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user) return null

                // Verificar la contrasenya
                const valid = await bcrypt.compare(credentials.password as string, user.password)
                if (!valid) return null

                return { id: String(user.id), email: user.email, name: user.username }
            }
        })
    ]
})
