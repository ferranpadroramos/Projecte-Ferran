import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

        const notifications = await prisma.notification.findMany({
            where: { receiverId: Number(session.user.id) },
            orderBy: { timestamp: "desc" },
            select: {
                id: true,
                timestamp: true,
                message: true,
                notiType: { select: { name: true } },
                sender: { select: { id: true, username: true, avatarUrl: true } },
                publication: { select: { id: true, text: true } },
                comment: { select: { id: true, text: true, publicationId: true } },
            }
        })

        await prisma.notification.updateMany({
            where: { receiverId: Number(session.user.id), read: false },
            data: { read: true }
        })

        return NextResponse.json(notifications)
    } catch (e) {
        console.error("[notifications GET error]", e)
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}
