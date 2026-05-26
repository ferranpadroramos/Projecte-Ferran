import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/comments — Crea un comentari o resposta a un comentari
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { text, publicationId, commentId } = await req.json()

    if (!text?.trim()) return NextResponse.json({ error: "El text és obligatori" }, { status: 400 })
    // Cal que tingui publicationId o commentId, però no cap dels dos
    if (!publicationId && !commentId) return NextResponse.json({ error: "Falta publicationId o commentId" }, { status: 400 })

    const authorId = Number(session.user.id)

    // Crear el comentari
    const comment = await prisma.comment.create({
        data: { text, authorId, publicationId, commentId }
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

    return NextResponse.json(comment, { status: 201 })
}
