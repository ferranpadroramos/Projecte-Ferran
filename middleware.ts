import { withAuth } from 'next-auth/middleware'

export default withAuth

export const config = {
    matcher: ['/home', '/publicate', '/reports', '/notifications', '/requests', '/messages', '/settings', '/user/:path*', '/chat/:path*']
}
