import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ count: 0 })

    const userId = Number(session.user.id)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })

    // Admin veu reports no llegits de tothom, usuari veu els seus resolts no llegits
    const count = await prisma.report.count({
        where: user?.isAdmin
            ? { read: false }
            : { authorId: userId, read: false, status: { not: 'pending' } }
    })

    return NextResponse.json({ count })
}
