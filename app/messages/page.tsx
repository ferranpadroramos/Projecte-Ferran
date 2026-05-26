'use client'
import { useEffect, useState } from "react"
import Link from "next/link"

type Conversation = {
    id: number
    other: { id: number, username: string, avatarUrl: string | null }
    lastMessage: { text: string, createdAt: string, senderId: number } | null
}

function formatDate(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ara"
    if (mins < 60) return `Fa ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Fa ${hours}h`
    return `Fa ${Math.floor(hours / 24)} dies`
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/messages")
            .then(res => res.json())
            .then(data => { setConversations(data); setLoading(false) })
    }, [])

    if (loading) return <p className="text-center mt-10 text-gray-400">Carregant...</p>

    return (
        <div className="max-w-xl mx-auto mt-6 px-4 flex flex-col gap-3">
            <h1 className="text-xl font-bold">Missatges</h1>

            {conversations.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-10">No tens cap conversa. Fes-te amic d'algú per poder xatejar!</p>
            )}

            {conversations.map(conv => (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                    <div className="border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:bg-gray-50">
                        <img
                            src={conv.other.avatarUrl ?? "/img/profile.png"}
                            alt={conv.other.username}
                            className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold">@{conv.other.username}</p>
                            {conv.lastMessage ? (
                                <p className="text-sm text-gray-400 truncate">{conv.lastMessage.text}</p>
                            ) : (
                                <p className="text-sm text-gray-300 italic">Sense missatges</p>
                            )}
                        </div>
                        {conv.lastMessage && (
                            <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(conv.lastMessage.createdAt)}</span>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    )
}
