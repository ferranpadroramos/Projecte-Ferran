import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// POST /api/publications — Crea una nova publicació
export async function POST(req: Request) {
    // Obtenir la sessió de l'usuari autenticat
    const session = await auth()
    // Si no hi ha sessió, retornar 401 (no autoritzat)
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    // Extreure el text del cos de la petició
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
