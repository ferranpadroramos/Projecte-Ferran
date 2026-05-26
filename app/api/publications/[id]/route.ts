import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// DELETE /api/publications/[id] — Esborrar una publicació pròpia
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const userId = Number(session.user.id)

    const publication = await prisma.publication.findUnique({ where: { id: Number(id) } })
    if (!publication) return NextResponse.json({ error: "No trobada" }, { status: 404 })
    if (publication.authorId !== userId) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    await prisma.publication.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true }, { status: 200 })
}

// PATCH /api/publications/[id] — Editar una publicació pròpia
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params
    const userId = Number(session.user.id)
    const { text } = await req.json()

    if (!text?.trim()) return NextResponse.json({ error: "El text és obligatori" }, { status: 400 })

    const publication = await prisma.publication.findUnique({ where: { id: Number(id) } })
    if (!publication) return NextResponse.json({ error: "No trobada" }, { status: 404 })
    if (publication.authorId !== userId) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    const updated = await prisma.publication.update({ where: { id: Number(id) }, data: { text } })
    return NextResponse.json(updated)
}
