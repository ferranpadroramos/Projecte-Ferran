import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTES = ['/login', '/register']

export default auth((req) => {
    const isPublic = PUBLIC_ROUTES.includes(req.nextUrl.pathname)
    if (!req.auth && !isPublic)
        return NextResponse.redirect(new URL('/login', req.url))
    if (req.auth && isPublic)
        return NextResponse.redirect(new URL('/home', req.url))
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|img|favicon.ico).*)'
    ]
}
