import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

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

    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { user1Id: sessionId, user2Id: Number(id) },
                { user1Id: Number(id), user2Id: sessionId }
            ]
        }
    })

    const friendRequest = await prisma.friendRequest.findFirst({
        where: {
            senderId: sessionId,
            receiverId: Number(id),
            status: "PENDING"
        }
    })


    return NextResponse.json({
        ...user,
        friendStatus: friendship ? 'friends' : friendRequest ? 'pending' : 'none'
    })
}
