import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/notifications — Retorna les notificacions de l'usuari autenticat
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const notifications = await prisma.notification.findMany({
        where: { receiverId: Number(session.user.id) },
        orderBy: { timestamp: "desc" },
        select: {
            id: true,
            timestamp: true,
            // Tipus de notificació
            notiType: { select: { name: true } },
            // Qui ha enviat la notificació
            sender: { select: { id: true, username: true, avatarUrl: true } },
            // Publicació relacionada (si n'hi ha)
            publication: { select: { id: true, text: true } },
            // Comentari relacionat (si n'hi ha)
            comment: { select: { id: true, text: true, publicationId: true } }
        }
    })

    return NextResponse.json(notifications)
}
