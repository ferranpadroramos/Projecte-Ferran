import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/comments — Crea un comentari o resposta a un comentari
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { text, publicationId, commentId, taggedIds } = await req.json()

    if (!text?.trim()) return NextResponse.json({ error: "El text és obligatori" }, { status: 400 })
    if (!publicationId && !commentId) return NextResponse.json({ error: "Falta publicationId o commentId" }, { status: 400 })

    const authorId = Number(session.user.id)

    const comment = await prisma.comment.create({
        data: {
            text, authorId, publicationId, commentId,
            ...(taggedIds?.length > 0 && {
                tags: { create: taggedIds.map((id: number) => ({ taggerId: authorId, taggedId: id })) }
            })
        },
        include: { author: { select: { id: true, username: true, avatarUrl: true } } }
    })

    // Notificar l'autor del contingut pare (publicació o comentari)
    const notiType = await prisma.notificationType.findUnique({ where: { name: "comment" } })
    if (notiType) {
        let receiverId: number | null = null

        if (commentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: commentId },
                select: { authorId: true }
            })
            receiverId = parentComment?.authorId ?? null
        } else if (publicationId) {
            const publication = await prisma.publication.findUnique({
                where: { id: publicationId },
                select: { authorId: true }
            })
            receiverId = publication?.authorId ?? null
        }

        // No notificar si l'autor es respon a si mateix
        if (receiverId && receiverId !== authorId) {
            await prisma.notification.create({
                data: {
                    typeId: notiType.id,
                    senderId: authorId,
                    receiverId,
                    publicationId: publicationId ?? null,
                    commentId: comment.id
                }
            })
        }
    }

    // Notificar als etiquetats
    if (taggedIds?.length > 0) {
        const tagNotiType = await prisma.notificationType.findUnique({ where: { name: "tag" } })
        if (tagNotiType) {
            await prisma.notification.createMany({
                data: taggedIds
                    .filter((id: number) => id !== authorId)
                    .map((id: number) => ({
                        typeId: tagNotiType.id,
                        senderId: authorId,
                        receiverId: id,
                        publicationId: publicationId ?? null,
                        commentId: comment.id
                    }))
            })
        }
    }

    return NextResponse.json(comment, { status: 201 })
}
