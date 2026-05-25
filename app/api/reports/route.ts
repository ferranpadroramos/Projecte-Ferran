import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/reports — Crear un report d'una publicació o comentari
export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { publicationId, commentId } = await req.json()
    if (!publicationId && !commentId) return NextResponse.json({ error: "Falta publicationId o commentId" }, { status: 400 })

    await prisma.report.create({
        data: {
            authorId: Number(session.user.id),
            publicationId: publicationId ?? null,
            commentId: commentId ?? null
        }
    })

    return NextResponse.json({ ok: true }, { status: 201 })
}
