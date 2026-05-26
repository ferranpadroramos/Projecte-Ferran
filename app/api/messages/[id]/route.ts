import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Comprova que l'usuari pertany a la conversa i la retorna
async function getConversation(id: string, userId: number) {
    const conversation = await prisma.conversation.findUnique({
        where: { id: Number(id) },
        select: { friendship: { select: { user1Id: true, user2Id: true } } }
    })
    if (!conversation) return null
    const { user1Id, user2Id } = conversation.friendship
    if (userId !== user1Id && userId !== user2Id) return null
    return conversation
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const conv = await getConversation(id, Number(session.user.id))
    if (!conv) return NextResponse.json({ error: "No trobada o no autoritzat" }, { status: 404 })

    const messages = await prisma.message.findMany({
        where: { conversationId: Number(id) },
        orderBy: { createdAt: "asc" },
        select: {
            id: true, text: true, createdAt: true,
            sender: { select: { id: true, username: true, avatarUrl: true } }
        }
    })

    return NextResponse.json(messages)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const { text } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: "El text és obligatori" }, { status: 400 })

    const conv = await getConversation(id, Number(session.user.id))
    if (!conv) return NextResponse.json({ error: "No trobada o no autoritzat" }, { status: 404 })

    const message = await prisma.message.create({
        data: { text, senderId: Number(session.user.id), conversationId: Number(id) },
        select: {
            id: true, text: true, createdAt: true,
            sender: { select: { id: true, username: true, avatarUrl: true } }
        }
    })

    return NextResponse.json(message, { status: 201 })
}
