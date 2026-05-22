'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

type User = {
    id: number
    username: string
    rank: { id: number, name: string } | null
    region: { name: string } | null
    role: { name: string }[]
    friendStatus: 'none' | 'pending' | 'friends'
    avatarUrl: string | null
}

// TODO: substituir per crida a API quan la BD estigui llesta
const MOCK_PUBLICATIONS = [
    { id: 1, text: "Primera publicació!", imageUrl: null, likes: 5 },
    { id: 2, text: "Segon post 🎮", imageUrl: "https://placehold.co/300x200", likes: 3 },
]

export default function UserPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none')
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        fetch(`/api/user/${id}`)
            .then(res => {
                if (!res.ok) { setNotFound(true); return }
                return res.json()
            })
            .then((data: User) => {
                if (!data) return
                setUser(data)
                setFriendStatus(data.friendStatus)
            })
    }, [id])

    async function handleFriendAction() {
        if (!user) return
        if (friendStatus === 'none') {
            await fetch('/api/friendship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: user.id })
            })
            setFriendStatus('pending')
        } else {
            await fetch('/api/friendship', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: user.id })
            })
            setFriendStatus('none')
        }
    }

    if (notFound) return <p>Usuari no trobat</p>
    if (!user) return <p className="text-center mt-10 text-gray-400">Carregant...</p>

    const isOwnProfile = session?.user?.id === String(user.id)

    return (
        <div className="max-w-xl mx-auto mt-8 px-4 flex flex-col gap-6">

            {/* Capçalera del perfil */}
            <div className="flex items-center gap-5">
                <img
                    src={user.avatarUrl ?? "/img/profile.png"}
                    alt={user.username}
                    className="w-20 h-20 rounded-full object-cover border"
                />
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold">@{user.username}</h1>
                    <p className="text-sm text-gray-500">{user.region?.name ?? "Sense regió"}</p>
                    {/* Rang */}
                    {user.rank && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full w-fit">
                            {user.rank.name}
                        </span>
                    )}
                    {/* Rols */}
                    <div className="flex gap-1 flex-wrap">
                        {user.role.map(r => (
                            <span key={r.name} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {r.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botons d'acció */}
            {!isOwnProfile && (
                <div className="flex gap-3">
                    <button
                        onClick={handleFriendAction}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                            friendStatus === 'none' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                            friendStatus === 'pending' ? 'bg-gray-200 text-gray-600' :
                            'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-600'
                        }`}
                    >
                        {friendStatus === 'none' && 'Sol·licitar amistat'}
                        {friendStatus === 'pending' && 'Sol·licitud enviada'}
                        {friendStatus === 'friends' && 'Amics ✓'}
                    </button>
                    {friendStatus === 'friends' && (
                        <a
                            href={`/chat/${user.id}`}
                            className="px-4 py-2 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200"
                        >
                            💬 Xat
                        </a>
                    )}
                </div>
            )}

            {/* Publicacions del perfil */}
            <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-gray-700">Publicacions</h2>
                {MOCK_PUBLICATIONS.map(pub => (
                    <div key={pub.id} className="border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                        <p className="text-sm">{pub.text}</p>
                        {pub.imageUrl && (
                            <img src={pub.imageUrl} alt="pub" className="rounded-lg w-full object-cover max-h-48" />
                        )}
                        <span className="text-xs text-gray-400">❤️ {pub.likes}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
