import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/publication/[id] — Retorna una publicació amb comentaris i likes
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    const userId = Number(session?.user?.id)

    const publication = await prisma.publication.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            text: true,
            imageUrl: true,
            createdAt: true,
            author: { select: { id: true, username: true, avatarUrl: true } },
            likes: { select: { userId: true } },
            tags: { select: { tagged: { select: { id: true, username: true } } } },
            comments: {
                where: { commentId: null }, // Només comentaris arrel (no respostes)
                orderBy: { timestamp: "asc" },
                select: {
                    id: true,
                    text: true,
                    timestamp: true,
                    author: { select: { id: true, username: true, avatarUrl: true } },
                    likes: { select: { userId: true } },
                    replies: {
                        orderBy: { timestamp: "asc" },
                        select: {
                            id: true,
                            text: true,
                            timestamp: true,
                            author: { select: { id: true, username: true, avatarUrl: true } },
                            likes: { select: { userId: true } },
                        }
                    }
                }
            }
        }
    })

    if (!publication) return NextResponse.json({ error: "No trobada" }, { status: 404 })

    return NextResponse.json({
        ...publication,
        likeCount: publication.likes.length,
        likedByMe: publication.likes.some(l => l.userId === userId),
        tags: publication.tags.map(t => t.tagged),
        comments: publication.comments.map(c => ({
            ...c,
            likeCount: c.likes.length,
            likedByMe: c.likes.some(l => l.userId === userId),
            replies: c.replies.map(r => ({
                ...r,
                likeCount: r.likes.length,
                likedByMe: r.likes.some(l => l.userId === userId),
            }))
        }))
    })
}
