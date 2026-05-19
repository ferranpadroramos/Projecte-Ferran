import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // Obtenir totes les regions
        const regions = await prisma.region.findMany({ select: { id: true, name: true, desc: true } })
        return NextResponse.json(regions)
    } catch {
        return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
    }
}
