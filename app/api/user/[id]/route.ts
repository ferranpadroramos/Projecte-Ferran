import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Obtenir l'id de la ruta i la sessió activa
    const { id } = await params
    const session = await auth()

    // Buscar l'usuari amb les seves relacions
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            username: true,
            rank: { select: { id: true, name: true } },
            region: { select: { name: true } },
            role: { select: { name: true } },
        }
    })

    if (!user) return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 })

    const sessionId = Number(session?.user?.id)

    // Comprovar si ja són amics
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { user1Id: sessionId, user2Id: Number(id) },
                { user1Id: Number(id), user2Id: sessionId }
            ]
        }
    })

    // Comprovar si hi ha una sol·licitud d'amistat pendent
    const friendRequest = await prisma.friendRequest.findFirst({
        where: {
            senderId: sessionId,
            receiverId: Number(id),
            status: "PENDING"
        }
    })

    // Retornar l'usuari amb l'estat d'amistat
    return NextResponse.json({
        ...user,
        friendStatus: friendship ? 'friends' : friendRequest ? 'pending' : 'none'
    })
}
