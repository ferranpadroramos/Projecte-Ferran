import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
    try{
        //Agafar dades de qui reb la solicitud i comprovar que surti bé
        const receiverId = await req.json()

        if (!receiverId) 
        return NextResponse.json({ error: "Falta el destinatari" }, { status: 400 })

        //Agafar dades de qui envia la solicitud(la sessió) i comprovar que surti bé
        const session = await auth()
        const senderId = Number(session?.user?.id)

        if (!senderId) 
        return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        //Creació de la solicitud via prisma
        await prisma.friendRequest.create({
            data: { senderId, receiverId }
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')){
            return NextResponse.json({ error: "Sol·licitud ja enviada" }, { status: 409 })
        }
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
}


    return NextResponse.json({ ok: true }, {status: 201})
}

export async function DELETE(req: NextRequest) {
    try{
        //Agafar dades de qui ha rebut la solicitud/amb qui té una amistat i comprovar que surti bé
        const { receiverId } = await req.json()

        if (!receiverId)
        return NextResponse.json({ error: "Falta el destinatari" }, { status: 400 })

        //Agafar dades de qui envia la solicitud o de qui és amic(la sessió) i comprovar que surti bé
        const session = await auth()
        const senderId = Number(session?.user?.id)

        if (!senderId) 
        return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        //Comprovar que existeixi la solicitud i en cas contrari esborrar l'amistat
        const friendRequest = await prisma.friendRequest.findFirst({
            where: { senderId, receiverId }
        })

        if (friendRequest) {
            await prisma.friendRequest.delete({ where: { id: friendRequest.id } })
        } else {
        await prisma.friendship.deleteMany({
            where: { OR: [
                    { user1Id: senderId, user2Id: receiverId },
                    { user1Id: receiverId, user2Id: senderId }
                    ]
            }
        })
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')){
            return NextResponse.json({ error: "Error en eliminar" }, { status: 409 })
        }
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
}


    return NextResponse.json({ ok: true }, {status: 200})
}