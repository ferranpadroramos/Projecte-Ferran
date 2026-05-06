import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
    try{
        //Agafar dades de la solicitud i comprovar que surti bé
        const solicitudId = await req.json()

        if (!solicitudId) 
        return NextResponse.json({ error: "No s'ha trobat la solicitud" }, { status: 400 })

        //Comprovar que s'hagi iniciat sessió i agafar dades de qui accepta la solicitud
        const session = await auth()
        const receiverId = Number(session?.user?.id)
        if (!receiverId) 
        return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        //Crear l'amistat
        const friendRequest = await prisma.friendRequest.findUnique({where:{id:solicitudId},select:{senderId:true}})
        const senderId = Number(friendRequest?.senderId)
        await prisma.friendship.create({ data: { user1Id: senderId, user2Id: receiverId } })

        //Esborrar la request un cop creada l'amistat
        await prisma.friendRequest.delete({where:{id:solicitudId}})

    }  catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint'))
        return NextResponse.json({ error: "Ja sou amics" }, { status: 409 })
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
}
    return NextResponse.json({ ok: true }, {status: 201})
}

export async function DELETE(req: NextRequest) {
    try{
        //Agafar dades de la solicitud i comprovar que surti bé
        const solicitudId = await req.json()

        if (!solicitudId) 
        return NextResponse.json({ error: "No s'ha trobat la solicitud" }, { status: 400 })

        //Comprovar que s'hagi iniciat sessió i agafar dades de qui accepta la solicitud
        const session = await auth()
        const receiverId = Number(session?.user?.id)
        if (!receiverId) 
        return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

        //Esborrar la request al ser rebutjada
        await prisma.friendRequest.delete({where:{id:solicitudId}})

        //Esborrar la notificacio
        const notiType = await prisma.notificationType.findFirst({ where: { name: "Friend request" }, select: { id: true } })
        const friendReq = await prisma.friendRequest.findUnique({ where: { id: solicitudId }, select: { senderId: true } })
        if (notiType && friendReq)
            await prisma.notification.deleteMany({ where: { receiverId, senderId: friendReq.senderId, typeId: notiType.id } })

    }  catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint'))
        return NextResponse.json({ error: "Ja sou amics" }, { status: 409 })
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
}
    return NextResponse.json({ ok: true }, {status: 201})
}