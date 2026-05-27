import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        const userId = Number(session?.user?.id)

        // Obtenir totes les publicacions amb autor, likes, comentaris i etiquetes
        const publications = await prisma.publication.findMany({
            where: { authorId: { not: userId } },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                text: true,
                imageUrl: true,
                createdAt: true,
                author: { select: { id: true, username: true, avatarUrl: true } },
                likes: { select: { userId: true } },
                comments: { select: { id: true } },
                tags: { select: { tagged: { select: { username: true } } } }
            }
        })

        // Afegir recompte de likes, comentaris i si l'usuari ha donat like
        return NextResponse.json(publications.map(p => ({
            id: p.id,
            text: p.text,
            imageUrl: p.imageUrl,
            createdAt: p.createdAt,
            author: p.author,
            likeCount: p.likes.length,
            commentCount: p.comments.length,
            likedByMe: p.likes.some(l => l.userId === userId),
            tags: p.tags.map(t => t.tagged.username)
        })))
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const { text, imageUrl, taggedIds } = await req.json()
    if (!text?.trim()) return NextResponse.json({ error: "El text és obligatori" }, { status: 400 })

    const publication = await prisma.publication.create({
        data: {
            text,
            imageUrl: imageUrl ?? null,
            authorId: Number(session.user.id),
            ...(taggedIds?.length > 0 && {
                tags: { create: taggedIds.map((id: number) => ({ taggerId: Number(session.user.id), taggedId: id })) }
            })
        }
    })

    return NextResponse.json(publication, { status: 201 })
}
