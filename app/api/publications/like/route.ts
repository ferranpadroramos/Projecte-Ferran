import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/publications/like — Donar like a una publicació
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { publicationId } = await req.json()
    if (!publicationId) return NextResponse.json({ error: "Falta publicationId" }, { status: 400 })

    const userId = Number(session.user.id)

    // Crear el like i notificar l'autor si no és el mateix usuari
    await prisma.like.create({ data: { userId, publicationId } })

    const publication = await prisma.publication.findUnique({
        where: { id: publicationId },
        select: { authorId: true }
    })

    if (publication && publication.authorId !== userId) {
        const notiType = await prisma.notificationType.findUnique({ where: { name: "like" } })
        if (notiType) {
            await prisma.notification.create({
                data: {
                    typeId: notiType.id,
                    senderId: userId,
                    receiverId: publication.authorId,
                    publicationId
                }
            })
        }
    }

    return NextResponse.json({ ok: true }, { status: 201 })
}

// DELETE /api/publications/like — Treure like d'una publicació
export async function DELETE(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { publicationId } = await req.json()
    if (!publicationId) return NextResponse.json({ error: "Falta publicationId" }, { status: 400 })

    const userId = Number(session.user.id)

    // Eliminar el like i la notificació associada
    await prisma.like.deleteMany({ where: { userId, publicationId } })
    const notiType = await prisma.notificationType.findUnique({ where: { name: "like" } })
    if (notiType)
        await prisma.notification.deleteMany({ where: { senderId: userId, publicationId, typeId: notiType.id } })

    return NextResponse.json({ ok: true }, { status: 200 })
}
