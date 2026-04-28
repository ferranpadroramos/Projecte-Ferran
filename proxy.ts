import { auth } from "@/auth"

export default auth((req) => {
    if (!req.auth) {
        return Response.redirect(new URL('/login', req.url))
    }
})

export const config = {
    matcher: ['/home', '/publicate', '/reports', '/notifications', '/requests', '/messages', '/settings', '/user/:path*', '/chat/:path*']
}
