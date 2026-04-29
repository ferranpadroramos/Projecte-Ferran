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
}

export default function UserPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        fetch(`/api/user/${id}`)
            .then(res => res.json())
            .then(setUser)
    }, [id])

    async function goToChat(e: React.SyntheticEvent) {
        e.preventDefault()
        await fetch('api/chat', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id })
        }
        )
    }

    async function handleFriendAction(e: React.SyntheticEvent) {
        e.preventDefault
        if (!user) return

    if (user.friendStatus === 'none') {
        await fetch('/api/friend-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: user.id })
        })
    } else if (user.friendStatus === 'pending') {
        await fetch('/api/friend-request', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: user.id })
        })
    } else if (user.friendStatus === 'friends') {
        await fetch('/api/friendship', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ friendId: user.id })
        })
    }
}


    if (!user) return <p>Carregant...</p>

    return (
        <div>
            <img src="/img/profile.png" alt="perfil" />
            <h1>{user.username}</h1>
            {user.rank && (
                <div>
                    <img src={`/img/ranks/${user.rank.id}.png`} alt={user.rank.name} />
                    <p>{user.rank.name}</p>
                </div>
            )}
            <p>{user.region?.name ?? '-'}</p>
            <form onSubmit={handleFriendAction}>
            {session?.user?.id !== String(user.id) && (
                <>
                    {user.friendStatus === 'none' && <button type='submit'>Sol·licitar amistat</button>}
                    {user.friendStatus === 'pending' && <button type='submit'>Sol·licitud enviada</button>}
                    {user.friendStatus === 'friends' && (
                        <>
                            <button type='submit'>Amics</button>
                            <form onSubmit={goToChat}><button type='submit'>Anar al xat</button></form>
                        </>
                    )}
                </>
            )}
            </form>
        </div>
    )
}
