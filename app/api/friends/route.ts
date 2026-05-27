import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticat" }, { status: 401 })

    const userId = Number(session.user.id)

    // Obtenir totes les amistats de l'usuari
    const friendships = await prisma.friendship.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        select: {
            user1: { select: { id: true, username: true } },
            user2: { select: { id: true, username: true } }
        }
    })

    // Retornar l'altre usuari de cada amistat
    const friends = friendships.map(f => f.user1.id === userId ? f.user2 : f.user1)

    return NextResponse.json(friends)
}
