'use client'
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Pusher from "pusher-js"

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

        // Subscriure's al canal del xat per rebre missatges en temps real
        const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER! })
        const channel = pusherClient.subscribe(`chat-${id}`)
        channel.bind("new-message", (msg: Message) => {
            setMessages(prev => {
                // Evitar duplicats (el missatge propi ja s'afegeix optimísticament)
                if (prev.some(m => m.id === msg.id)) return prev
                return [...prev, msg]
            })
        })
        return () => pusherClient.unsubscribe(`chat-${id}`)
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

            <div className="border-b border-gray-100 px-4 py-3 flex items-center gap-3 bg-white">
                <Link href="/messages" className="text-gray-400 hover:text-[#FF4655] transition-colors text-sm">← Tornar</Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map(msg => {
                    const isOwn = String(msg.sender.id) === session?.user?.id
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                            {!isOwn && (
                                <Link href={`/user/${msg.sender.id}`}>
                                    <img src={msg.sender.avatarUrl ?? "/img/profile.png"} alt={msg.sender.username} className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                                </Link>
                            )}
                            <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${isOwn ? "bg-[#FF4655] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                                <p>{msg.text}</p>
                                <p className={`text-xs mt-0.5 ${isOwn ? "text-red-200" : "text-gray-400"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-100 px-4 py-3 flex gap-2 bg-white">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Escriu un missatge..."
                    className="input"
                />
                <button onClick={handleSend} className="btn btn-primary px-4">Enviar</button>
            </div>
        </div>
    )
}
