import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        const userId = Number(session?.user?.id)

        // Obtenir totes les publicacions amb autor, likes i comentaris
        const publications = await prisma.publication.findMany({
            where: { authorId: { not: userId } },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                text: true,
                createdAt: true,
                author: { select: { id: true, username: true } },
                likes: { select: { userId: true } },
                comments: { select: { id: true } }
            }
        })

        // Afegir recompte de likes, comentaris i si l'usuari ha donat like
        return NextResponse.json(publications.map(p => ({
            ...p,
            likeCount: p.likes.length,
            commentCount: p.comments.length,
            likedByMe: p.likes.some(l => l.userId === userId)
        })))
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    // Extreure el text del cos de la publicacio
    const { text } = await req.json()
    
    // Validar que el text no estigui buit
    if (!text?.trim()) return NextResponse.json({ error: "El text és obligatori" }, { status: 400 })

    // Crear la publicació a la base de dades
    const publication = await prisma.publication.create({
        data: {
            text,
            authorId: Number(session.user.id) // Convertir l'id de string a number (Prisma espera Int)
        }
    })

    // Retornar la publicació creada amb codi 201 (Created)
    return NextResponse.json(publication, { status: 201 })
}
