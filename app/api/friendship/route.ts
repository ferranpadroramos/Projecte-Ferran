import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
    const { receiverId } = await req.json()
    if (!receiverId) return NextResponse.json({ error: "Falta el destinatari" }, { status: 400 })

    const session = await auth()
    const senderId = Number(session?.user?.id)
    if (!senderId) return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

    try {
        await prisma.friendRequest.create({ data: { senderId, receiverId } })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint'))
            return NextResponse.json({ error: "Sol·licitud ja enviada" }, { status: 409 })
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
    const { receiverId } = await req.json()
    if (!receiverId) return NextResponse.json({ error: "Falta el destinatari" }, { status: 400 })

    const session = await auth()
    const senderId = Number(session?.user?.id)
    if (!senderId) return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

    try {
        // Si existeix sol·licitud pendent, esborrar-la; si no, esborrar l'amistat
        const friendRequest = await prisma.friendRequest.findFirst({ where: { senderId, receiverId } })
        if (friendRequest) {
            await prisma.friendRequest.delete({ where: { id: friendRequest.id } })
        } else {
            await prisma.friendship.deleteMany({
                where: { OR: [{ user1Id: senderId, user2Id: receiverId }, { user1Id: receiverId, user2Id: senderId }] }
            })
        }
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
}
