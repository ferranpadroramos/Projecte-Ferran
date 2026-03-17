import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const auth = NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                return null
            }
        })
    ]
})