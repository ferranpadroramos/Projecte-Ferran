import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Obtenir tots els rols
        const roles = await prisma.role.findMany({ select: { id: true, name: true } })
        return NextResponse.json(roles)
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}
