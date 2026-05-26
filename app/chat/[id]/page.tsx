'use client'
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

type Message = {
    id: number
    text: string
    createdAt: string
    sender: { id: number, username: string, avatarUrl: string | null }
}

export default function ChatPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [text, setText] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch(`/api/messages/${id}`)
            .then(res => res.json())
            .then(setMessages)
    }, [id])

    // Fer scroll automàtic al final quan arriben nous missatges
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function handleSend() {
        if (!text.trim()) return
        const res = await fetch(`/api/messages/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        })
        const newMessage = await res.json()
        setMessages(prev => [...prev, newMessage])
        setText("")
    }

    return (
        <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-4rem)]">

            {/* Capçalera del xat */}
            <div className="border-b px-4 py-3 flex items-center gap-3">
                <Link href="/messages" className="text-gray-400 hover:text-gray-600 text-sm">← Tornar</Link>
            </div>

            {/* Llista de missatges */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map(msg => {
                    const isOwn = String(msg.sender.id) === session?.user?.id
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                            {/* Avatar només pels missatges de l'altre */}
                            {!isOwn && (
                                <Link href={`/user/${msg.sender.id}`}>
                                    <img src={msg.sender.avatarUrl ?? "/img/profile.png"} alt={msg.sender.username} className="w-7 h-7 rounded-full object-cover border flex-shrink-0" />
                                </Link>
                            )}
                            <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${isOwn ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-0.5 ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            {/* Camp d'enviament */}
            <div className="border-t px-4 py-3 flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Escriu un missatge..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm outline-none"
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-500 text-white rounded-full px-4 py-2 text-sm hover:bg-blue-600"
                >
                    Enviar
                </button>
            </div>
        </div>
    )
}
