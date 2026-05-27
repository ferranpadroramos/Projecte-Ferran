import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    const sessionId = Number(session?.user?.id)

    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            username: true,
            avatarUrl: true,
            rank: { select: { id: true, name: true } },
            region: { select: { id: true, name: true } },
            role: { select: { id: true, name: true } },
        }
    })

    if (!user) return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 })

    const friendship = await prisma.friendship.findFirst({
        where: { OR: [{ user1Id: sessionId, user2Id: Number(id) }, { user1Id: Number(id), user2Id: sessionId }] },
        select: { conversation: { select: { id: true } } }
    })

    const friendRequest = await prisma.friendRequest.findFirst({
        where: { senderId: sessionId, receiverId: Number(id) }
    })

    const publications = await prisma.publication.findMany({
        where: { authorId: Number(id) },
        select: { id: true, text: true, imageUrl: true, likes: { select: { id: true } } },
        orderBy: { id: 'desc' }
    })

    return NextResponse.json({
        ...user,
        friendStatus: friendship ? 'friends' : friendRequest ? 'pending' : 'none',
        conversationId: friendship?.conversation?.id ?? null,
        publications: publications.map(p => ({ ...p, likes: p.likes.length }))
    })
}

// PATCH /api/user/[id] — Actualitzar username i/o avatar de l'usuari
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { id } = await params

    // Només l'usuari pot modificar el seu propi perfil
    if (session.user.id !== id) return NextResponse.json({ error: "No autoritzat" }, { status: 403 })

    const { username, avatarUrl, rankId, regionId, roleIds } = await req.json()

    const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: {
            ...(username?.trim() && { username }),
            ...(avatarUrl && { avatarUrl }),
            ...(rankId && { rankId }),
            ...(regionId && { regionId }),
            ...(roleIds && { role: { set: roleIds.map((rid: number) => ({ id: rid })) } })
        },
        select: { id: true, username: true, avatarUrl: true }
    })

    return NextResponse.json(updated)
}
