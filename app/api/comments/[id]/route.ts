import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// DELETE /api/comments/[id] — Esborrar un comentari propi
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const userId = Number(session.user.id)

    // Comprovar que el comentari pertany a l'usuari
    const comment = await prisma.comment.findUnique({ where: { id: Number(id) } })
    if (!comment) return NextResponse.json({ error: "No trobat" }, { status: 404 })
    if (comment.authorId !== userId) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    await prisma.comment.delete({ where: { id: Number(id) } })

    return NextResponse.json({ ok: true }, { status: 200 })
}
