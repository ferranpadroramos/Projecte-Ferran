import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
    try {
        const session = await auth()
        const receiverId = Number(session?.user?.id)

        if (!receiverId)
            return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        const requests = await prisma.friendRequest.findMany({
            where: { receiverId },
            select: {
                id: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        rank: { select: { id: true, name: true } }
                    }
                }
            }
        })

        return NextResponse.json(requests)
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { solicitudId } = await req.json()

        if (!solicitudId)
            return NextResponse.json({ error: "No s'ha trobat la solicitud" }, { status: 400 })

        const session = await auth()
        const receiverId = Number(session?.user?.id)

        if (!receiverId)
            return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        const friendRequest = await prisma.friendRequest.findUnique({ where: { id: solicitudId }, select: { senderId: true } })

        if (!friendRequest)
            return NextResponse.json({ error: "Sol·licitud no trobada" }, { status: 404 })

        const senderId = friendRequest.senderId

        await prisma.friendship.create({ data: { user1Id: senderId, user2Id: receiverId } })
        await prisma.friendRequest.delete({ where: { id: solicitudId } })

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint'))
            return NextResponse.json({ error: "Ja sou amics" }, { status: 409 })
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
    try {
        const { solicitudId } = await req.json()

        if (!solicitudId)
            return NextResponse.json({ error: "No s'ha trobat la solicitud" }, { status: 400 })

        const session = await auth()
        const receiverId = Number(session?.user?.id)

        if (!receiverId)
            return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        // Obtenir el senderId abans d'esborrar
        const notiType = await prisma.notificationType.findFirst({ where: { name: "Friend request" }, select: { id: true } })
        const friendReq = await prisma.friendRequest.findUnique({ where: { id: solicitudId }, select: { senderId: true } })

        await prisma.friendRequest.delete({ where: { id: solicitudId } })

        if (notiType && friendReq)
            await prisma.notification.deleteMany({ where: { receiverId, senderId: friendReq.senderId, typeId: notiType.id } })

    } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint'))
            return NextResponse.json({ error: "Error en rebutjar" }, { status: 409 })
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
}
