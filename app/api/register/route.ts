import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    // Llegir dades del body
    const { username, email, password } = await req.json()

    // Validar que no falten camps
    if (!username || !email || !password)
        return NextResponse.json({ error: "Falten camps" }, { status: 400 })

    // Comprovar si l'email ja existeix
    const emailExists = await prisma.user.findUnique({ where: { email } })
    if (emailExists)
        return NextResponse.json({ error: "Aquest email ja està en ús" }, { status: 409 })

    // Comprovar si el nom d'usuari ja existeix
    const usernameExists = await prisma.user.findUnique({ where: { username } })
    if (usernameExists)
        return NextResponse.json({ error: "Aquest nom d'usuari ja està en ús" }, { status: 409 })

    // Encriptar la contrasenya i crear l'usuari
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { username, email, password: hashed } })

    return NextResponse.json({ ok: true }, { status: 201 })
}
