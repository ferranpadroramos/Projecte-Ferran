import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// DELETE /api/publications/[id] — Esborrar una publicació pròpia
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const userId = Number(session.user.id)

    // Comprovar que la publicació pertany a l'usuari
    const publication = await prisma.publication.findUnique({ where: { id: Number(id) } })
    if (!publication) return NextResponse.json({ error: "No trobada" }, { status: 404 })
    if (publication.authorId !== userId) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    await prisma.publication.delete({ where: { id: Number(id) } })

    return NextResponse.json({ ok: true }, { status: 200 })
}
