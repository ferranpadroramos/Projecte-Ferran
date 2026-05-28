import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH /api/reports/[id] — Editar motius (usuari) o respondre (admin)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const userId = Number(session.user.id)

    const report = await prisma.report.findUnique({
        where: { id: Number(id) },
        include: {
            publication: { select: { id: true, authorId: true } },
            comment: { select: { id: true, authorId: true } }
        }
    })
    if (!report) return NextResponse.json({ error: "Report no trobat" }, { status: 404 })

    // Si ve "reasons", és una edició de l'usuari (només si és el seu report i està pendent)
    if (body.reasons) {
        if (report.authorId !== userId) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })
        if (report.status !== "pending") return NextResponse.json({ error: "Només es poden editar reports pendents" }, { status: 400 })
        await prisma.report.update({ where: { id: Number(id) }, data: { reasons: body.reasons } })
        return NextResponse.json({ ok: true })
    }

    // Si ve "status", és una resposta de l'admin
    const admin = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } })
    if (!admin?.isAdmin) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    const { status, adminComment, deleteContent, notifyCreator, notifyText } = body
    if (!["accepted", "rejected"].includes(status))
        return NextResponse.json({ error: "Estat invàlid" }, { status: 400 })

    await prisma.report.update({
        where: { id: Number(id) },
        data: { status, adminComment: adminComment ?? null, resolvedAt: new Date() }
    })

    const contentAuthorId = report.publication?.authorId ?? report.comment?.authorId

    if (deleteContent && status === "accepted") {
        if (report.publicationId) await prisma.publication.delete({ where: { id: report.publicationId } })
        else if (report.commentId) await prisma.comment.delete({ where: { id: report.commentId } })
    }

    const notiType = await prisma.notificationType.findUnique({ where: { name: "report" } })

    if (notiType) {
        // Notificar a l'autor del report (qui va reportar)
        const reporterMessage = status === "accepted"
            ? `El teu report ha estat acceptat${adminComment ? `: "${adminComment}"` : "."}`
            : `El teu report ha estat rebutjat${adminComment ? `: "${adminComment}"` : "."}`

        await prisma.notification.create({
            data: {
                typeId: notiType.id,
                senderId: userId,
                receiverId: report.authorId,
                publicationId: report.publicationId ?? null,
                commentId: report.commentId ?? null,
                message: reporterMessage
            }
        })

        // Notificar al creador del contingut si l'admin ho indica
        if (notifyCreator && notifyText?.trim() && contentAuthorId) {
            await prisma.notification.create({
                data: {
                    typeId: notiType.id,
                    senderId: userId,
                    receiverId: contentAuthorId,
                    publicationId: report.publicationId ?? null,
                    commentId: report.commentId ?? null,
                    message: notifyText.trim()
                }
            })
        }
    }

    return NextResponse.json({ ok: true })
}

// DELETE /api/reports/[id] — Eliminar un report propi
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const userId = Number(session.user.id)

    const report = await prisma.report.findUnique({ where: { id: Number(id) } })
    if (!report) return NextResponse.json({ error: "No trobat" }, { status: 404 })
    if (report.authorId !== userId) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    await prisma.report.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
}
