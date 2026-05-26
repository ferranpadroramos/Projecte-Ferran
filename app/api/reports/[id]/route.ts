import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH /api/reports/[id] — Respondre un report (acceptar o rebutjar) amb notificació opcional
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    // Comprovar que és admin
    const admin = await prisma.user.findUnique({ where: { id: Number(session.user.id) }, select: { isAdmin: true } })
    if (!admin?.isAdmin) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    const { id } = await params
    const { status, adminComment, deleteContent, notifyCreator, notifyText } = await req.json()

    if (!["accepted", "rejected"].includes(status))
        return NextResponse.json({ error: "Estat invàlid" }, { status: 400 })

    // Obtenir el report amb el contingut relacionat
    const report = await prisma.report.findUnique({
        where: { id: Number(id) },
        include: {
            publication: { select: { id: true, authorId: true } },
            comment: { select: { id: true, authorId: true } }
        }
    })
    if (!report) return NextResponse.json({ error: "Report no trobat" }, { status: 404 })

    // Actualitzar l'estat del report
    await prisma.report.update({
        where: { id: Number(id) },
        data: { status, adminComment: adminComment ?? null, resolvedAt: new Date() }
    })

    const contentAuthorId = report.publication?.authorId ?? report.comment?.authorId

    // Esborrar el contingut si l'admin ho ha indicat (només en acceptar)
    if (deleteContent && status === "accepted") {
        if (report.publicationId) {
            await prisma.publication.delete({ where: { id: report.publicationId } })
        } else if (report.commentId) {
            await prisma.comment.delete({ where: { id: report.commentId } })
        }
    }

    // Notificar al creador si s'ha indicat i hi ha text
    if (notifyCreator && notifyText?.trim() && contentAuthorId) {
        const notiType = await prisma.notificationType.findUnique({ where: { name: "report" } })
        if (notiType) {
            await prisma.notification.create({
                data: {
                    typeId: notiType.id,
                    senderId: Number(session.user.id),
                    receiverId: contentAuthorId,
                    publicationId: report.publicationId ?? null,
                    commentId: report.commentId ?? null
                }
            })
        }
    }

    return NextResponse.json({ ok: true })
}
