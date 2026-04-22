import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    const { username, email, password } = await req.json()

    if (!username || !email || !password)
        return NextResponse.json({ error: "Falten camps" }, { status: 400 })

    const exists = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
    })
    if (exists)
        return NextResponse.json({ error: "Usuari o email ja existeix" }, { status: 409 })

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { username, email, password: hashed } })

    return NextResponse.json({ ok: true }, { status: 201 })
}
