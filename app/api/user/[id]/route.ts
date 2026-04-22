import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            username: true,
            rank: { select: { id: true, name: true } },
            region: { select: { name: true } },
            role: { select: { name: true } },
        }
    })

    if (!user) return NextResponse.json({ error: "Usuari no trobat" }, { status: 404 })

    return NextResponse.json(user)
}
