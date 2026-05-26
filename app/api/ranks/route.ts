import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Obtenir tots els rangs
        const ranks = await prisma.rank.findMany({ select: { id: true, name: true, desc: true, imageUrl: true } })
        return NextResponse.json(ranks)
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}
