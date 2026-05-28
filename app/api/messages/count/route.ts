import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ count: 0 })

    try {
        const userId = Number(session.user.id)

        const count = await prisma.message.count({
            where: {
                read: false,
                senderId: { not: userId },
                conversation: {
                    friendship: {
                        OR: [{ user1Id: userId }, { user2Id: userId }]
                    }
                }
            }
        })

        return NextResponse.json({ count })
    } catch {
        return NextResponse.json({ count: 0 })
    }
}
