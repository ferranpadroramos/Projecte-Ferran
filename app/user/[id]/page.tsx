'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import ContentMenu from '@/components/ui/ContentMenu'

type User = {
    id: number
    username: string
    rank: { id: number, name: string } | null
    region: { name: string } | null
    role: { name: string }[]
    friendStatus: 'none' | 'pending' | 'friends'
    avatarUrl: string | null
    publications: { id: number, text: string, imageUrl: string | null, likes: number }[]
}

export default function UserPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const [user, setUser] = useState<User | null>(null)
    const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>('none')
    const [notFound, setNotFound] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

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
            // Enviar sol·licitud directament sense confirmació
            await fetch('/api/friendship', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: user.id })
            })
            setFriendStatus('pending')
        } else {
            // Cancel·lar sol·licitud o eliminar amistat — demanar confirmació
            setShowConfirm(true)
        }
    }

    async function confirmFriendAction() {
        if (!user) return
        await fetch('/api/friendship', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: user.id })
        })
        setFriendStatus('none')
        setShowConfirm(false)
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
                            friendStatus === 'pending' ? 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600' :
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
                {user.publications.length === 0 && (
                    <p className="text-sm text-gray-400">Encara no hi ha publicacions</p>
                )}
                {user.publications.map(pub => (
                    <div key={pub.id} className="border rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-sm flex-1">{pub.text}</p>
                            {/* Menú d'opcions a les publicacions del perfil */}
                            <ContentMenu
                                isOwner={isOwnProfile}
                                publicationId={pub.id}
                                onDelete={() => setUser(prev => prev ? { ...prev, publications: prev.publications.filter(p => p.id !== pub.id) } : prev)}
                            />
                        </div>
                        {pub.imageUrl && (
                            <img src={pub.imageUrl} alt="pub" className="rounded-lg w-full object-cover max-h-48" />
                        )}
                        <span className="text-xs text-gray-400">❤️ {pub.likes}</span>
                    </div>
                ))}
            </div>

            {/* Modal de confirmació per cancel·lar sol·licitud o eliminar amistat */}
            {showConfirm && (
                <ConfirmModal
                    message={
                        friendStatus === 'pending'
                            ? `Vols cancel·lar la sol·licitud enviada a @${user.username}?`
                            : `Vols eliminar @${user.username} dels teus amics?`
                    }
                    onConfirm={confirmFriendAction}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </div>
    )
}
