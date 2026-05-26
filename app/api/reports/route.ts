import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/reports — Obtenir tots els reports (només admin)
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    // Comprovar que l'usuari és admin
    const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) }, select: { isAdmin: true } })
    if (!user?.isAdmin) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    const reports = await prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            reasons: true,
            status: true,
            adminComment: true,
            createdAt: true,
            resolvedAt: true,
            author: { select: { id: true, username: true } },
            publication: {
                select: {
                    id: true,
                    text: true,
                    imageUrl: true,
                    author: { select: { id: true, username: true } }
                }
            },
            comment: {
                select: {
                    id: true,
                    text: true,
                    author: { select: { id: true, username: true } },
                    publicationId: true
                }
            }
        }
    })

    return NextResponse.json(reports)
}

// POST /api/reports — Crear un report
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { publicationId, commentId, reasons } = await req.json()
    if (!publicationId && !commentId) return NextResponse.json({ error: "Falta publicationId o commentId" }, { status: 400 })

    await prisma.report.create({
        data: {
            authorId: Number(session.user.id),
            publicationId: publicationId ?? null,
            commentId: commentId ?? null,
            reasons: reasons ?? []
        }
    })

    return NextResponse.json({ ok: true }, { status: 201 })
}
