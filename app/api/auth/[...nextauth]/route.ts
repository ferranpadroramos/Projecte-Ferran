import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const auth = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                if(!credentials?.email || !credentials?.password) return null
                
                const player = await prisma.player.findUnique({
                    where: { email: credentials.email as string }
                })

                if(!player) return null

                const valid = await bcrypt.compare(credentials.password as string, player.password)
                if(!valid) return null

                return { id: String(player.id), email:player?.email, name: player?.username}
            }
        })
    ]
})

export const { GET, POST} = auth