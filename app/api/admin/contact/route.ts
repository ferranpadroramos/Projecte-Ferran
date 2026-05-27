import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const userId = Number(session.user.id)

    // Buscar un admin
    const admin = await prisma.user.findFirst({ where: { isAdmin: true }, select: { id: true } })
    if (!admin) return NextResponse.json({ error: "No hi ha cap admin disponible" }, { status: 404 })

    // Si ja existeix una amistat, retornar la conversa existent
    const existing = await prisma.friendship.findFirst({
        where: { OR: [{ user1Id: userId, user2Id: admin.id }, { user1Id: admin.id, user2Id: userId }] },
        select: { conversation: { select: { id: true } } }
    })
    if (existing?.conversation) return NextResponse.json({ conversationId: existing.conversation.id })

    // Crear amistat i conversa directament sense sol·licitud
    const friendship = await prisma.friendship.create({ data: { user1Id: userId, user2Id: admin.id } })
    const conversation = await prisma.conversation.create({ data: { friendshipId: friendship.id } })

    return NextResponse.json({ conversationId: conversation.id })
}
