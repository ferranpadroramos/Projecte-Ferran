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
    conversationId: number | null
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
        <div className="page">
            <div className="card flex items-center gap-5">
                <img src={user.avatarUrl ?? "/img/profile.png"} alt={user.username} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold">@{user.username}</h1>
                    <p className="text-sm text-gray-500">{user.region?.name ?? "Sense regió"}</p>
                    {user.rank && (
                        <div className="flex items-center gap-1">
                            <img src={`/img/ranks/${user.rank.id}.png`} alt={user.rank.name} className="w-5 h-5 object-contain" />
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full w-fit">{user.rank.name}</span>
                        </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                        {user.role.map(r => (
                            <span key={r.name} className="text-xs bg-[#fff0f1] text-[#FF4655] px-2 py-0.5 rounded-full">{r.name}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botons d'acció */}
            {!isOwnProfile && (
                <div className="flex gap-3 flex-wrap">
                    {friendStatus === 'none' && (
                        <button onClick={handleFriendAction} className="btn btn-primary">
                            + Sol·licitar amistat
                        </button>
                    )}
                    {friendStatus === 'pending' && (
                        <>
                            <button className="btn btn-secondary" disabled>Sol·licitud enviada</button>
                            <button onClick={handleFriendAction} className="btn btn-danger">Cancel·lar sol·licitud</button>
                        </>
                    )}
                    {friendStatus === 'friends' && (
                        <>
                            <span className="btn btn-secondary pointer-events-none">✓ Amics</span>
                            {friendStatus === 'friends' && user.conversationId && (
                                <a href={`/chat/${user.conversationId}`} className="btn btn-primary">💬 Xat</a>
                            )}
                            <button onClick={handleFriendAction} className="btn btn-danger">Eliminar amic</button>
                        </>
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
                    <div key={pub.id} className="card flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <p className="text-sm flex-1">{pub.text}</p>
                            <ContentMenu
                                isOwner={isOwnProfile}
                                authorId={user.id}
                                publicationId={pub.id}
                                currentText={pub.text}
                                onDelete={() => setUser(prev => prev ? { ...prev, publications: prev.publications.filter(p => p.id !== pub.id) } : prev)}
                                onEdit={newText => setUser(prev => prev ? { ...prev, publications: prev.publications.map(p => p.id === pub.id ? { ...p, text: newText } : p) } : prev)}
                            />
                        </div>
                        {pub.imageUrl && <img src={pub.imageUrl} alt="pub" className="rounded-lg w-full object-cover max-h-48" />}
                        <span className="text-xs text-gray-400">❤️ {pub.likes}</span>
                    </div>
                ))}
            </div>
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
