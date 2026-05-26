import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/messages — Retorna totes les converses de l'usuari amb l'últim missatge
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const userId = Number(session.user.id)

    const conversations = await prisma.conversation.findMany({
        where: {
            friendship: {
                OR: [{ user1Id: userId }, { user2Id: userId }]
            }
        },
        select: {
            id: true,
            friendship: {
                select: {
                    user1: { select: { id: true, username: true, avatarUrl: true } },
                    user2: { select: { id: true, username: true, avatarUrl: true } }
                }
            },
            // Últim missatge de la conversa
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { text: true, createdAt: true, senderId: true }
            }
        }
    })

    // Retornar l'altre usuari de la conversa (no el propi)
    const result = conversations.map(c => ({
        id: c.id,
        other: c.friendship.user1.id === userId ? c.friendship.user2 : c.friendship.user1,
        lastMessage: c.messages[0] ?? null
    }))

    return NextResponse.json(result)
}
