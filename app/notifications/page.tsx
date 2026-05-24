'use client'
import Link from "next/link"

// TODO: substituir per crida a API quan la BD estigui llesta
const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: "like",
        sender: { id: 2, username: "anna99", avatarUrl: null },
        timestamp: "Fa 5 minuts"
    },
    {
        id: 2,
        type: "comment",
        sender: { id: 3, username: "marc_dev", avatarUrl: null },
        timestamp: "Fa 1 hora"
    },
    {
        id: 3,
        type: "friend_request",
        sender: { id: 4, username: "laura_gx", avatarUrl: null },
        timestamp: "Fa 3 hores"
    },
    {
        id: 4,
        type: "tag",
        sender: { id: 5, username: "jordi22", avatarUrl: null },
        timestamp: "Fa 1 dia"
    },
]

// Text descriptiu segons el tipus de notificació
const NOTIFICATION_TEXT: Record<string, string> = {
    like: "ha donat like a la teva publicació ❤️",
    comment: "ha comentat la teva publicació 💬",
    friend_request: "t'ha enviat una sol·licitud d'amistat 👋",
    tag: "t'ha etiquetat en una publicació 🏷️",
}

export default function NotificationsPage() {
    return (
        <div className="max-w-xl mx-auto mt-6 flex flex-col gap-3 px-4">
            <h1 className="text-xl font-bold mb-2">Notificacions</h1>
            {MOCK_NOTIFICATIONS.map(noti => (
                <div key={noti.id} className="border rounded-xl p-4 flex items-center gap-3 shadow-sm">

                    {/* Avatar del sender */}
                    <Link href={`/user/${noti.sender.id}`}>
                        <img
                            src={noti.sender.avatarUrl ?? "/img/profile.png"}
                            alt={noti.sender.username}
                            className="w-10 h-10 rounded-full object-cover border flex-shrink-0"
                        />
                    </Link>

                    {/* Text de la notificació */}
                    <div className="flex flex-col flex-1">
                        <p className="text-sm">
                            <Link href={`/user/${noti.sender.id}`} className="font-semibold hover:underline">
                                @{noti.sender.username}
                            </Link>
                            {" "}{NOTIFICATION_TEXT[noti.type]}
                        </p>
                        <span className="text-xs text-gray-400">{noti.timestamp}</span>
                    </div>
                </div>
            ))}

            {MOCK_NOTIFICATIONS.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-10">No tens notificacions</p>
            )}
        </div>
    )
}
