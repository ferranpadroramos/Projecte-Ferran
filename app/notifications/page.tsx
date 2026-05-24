'use client'
import { useEffect, useState } from "react"
import Link from "next/link"

type Notification = {
    id: number
    timestamp: string
    notiType: { name: string }
    sender: { id: number, username: string, avatarUrl: string | null }
    publication: { id: number, text: string } | null
    comment: { id: number, text: string, publicationId: number | null } | null
}

// Text de la notificació segons el tipus
function getNotiText(type: string, publication: Notification["publication"], comment: Notification["comment"]) {
    switch (type) {
        case "like":
            return publication
                ? `ha donat like a la teva publicació ❤️`
                : `ha donat like al teu comentari ❤️`
        case "comment":
            return comment?.text
                ? `ha comentat: "${comment.text.slice(0, 50)}${comment.text.length > 50 ? "..." : ""}" 💬`
                : `ha comentat la teva publicació 💬`
        case "friend_request":
            return `t'ha enviat una sol·licitud d'amistat 👋`
        case "tag":
            return publication
                ? `t'ha etiquetat en una publicació 🏷️`
                : `t'ha etiquetat en un comentari 🏷️`
        case "report":
            return `ha reportat una publicació ⚠️`
        default:
            return `t'ha enviat una notificació`
    }
}

// Link de destí de la notificació
function getNotiLink(type: string, publication: Notification["publication"], comment: Notification["comment"], senderId: number) {
    if (type === "friend_request") return `/user/${senderId}`
    if (publication) return `/publication/${publication.id}`
    if (comment?.publicationId) return `/publication/${comment.publicationId}`
    return "#"
}

// Format de la data
function formatDate(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ara mateix"
    if (mins < 60) return `Fa ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `Fa ${hours}h`
    return `Fa ${Math.floor(hours / 24)} dies`
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/notifications")
            .then(res => res.json())
            .then(data => { setNotifications(data); setLoading(false) })
    }, [])

    if (loading) return <p className="text-center mt-10 text-gray-400">Carregant...</p>

    return (
        <div className="max-w-xl mx-auto mt-6 flex flex-col gap-3 px-4">
            <h1 className="text-xl font-bold mb-2">Notificacions</h1>

            {notifications.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-10">No tens notificacions</p>
            )}

            {notifications.map(noti => {
                const link = getNotiLink(noti.notiType.name, noti.publication, noti.comment, noti.sender.id)
                return (
                    <Link href={link} key={noti.id}>
                        <div className="border rounded-xl p-4 flex items-center gap-3 shadow-sm hover:bg-gray-50">

                            {/* Avatar del sender */}
                            <img
                                src={noti.sender.avatarUrl ?? "/img/profile.png"}
                                alt={noti.sender.username}
                                className="w-10 h-10 rounded-full object-cover border flex-shrink-0"
                            />

                            {/* Text de la notificació */}
                            <div className="flex flex-col flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-semibold">@{noti.sender.username}</span>
                                    {" "}{getNotiText(noti.notiType.name, noti.publication, noti.comment)}
                                </p>
                                {/* Context: text de la publicació relacionada */}
                                {noti.publication && (
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        "{noti.publication.text}"
                                    </p>
                                )}
                                <span className="text-xs text-gray-400 mt-0.5">{formatDate(noti.timestamp)}</span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
