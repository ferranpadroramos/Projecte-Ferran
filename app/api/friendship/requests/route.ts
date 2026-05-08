import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
    const session = await auth()
    const receiverId = Number(session?.user?.id)

    if (!receiverId)
        return NextResponse.json({ error: "No has iniciat sessió" }, { status: 401 })

    const requests = await prisma.friendRequest.findMany({
        where: { receiverId },
        select: {
            id: true,
            sender: {
                select: {
                    id: true,
                    username: true,
                    rank: { select: { id: true, name: true } }
                }
            }
        }
    })

    return NextResponse.json(requests)
}
