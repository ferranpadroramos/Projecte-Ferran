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

            {session?.user?.id !== String(user.id) && (
                <>
                    {user.friendStatus === 'none' && <button>Sol·licitar amistat</button>}
                    {user.friendStatus === 'pending' && <button>Sol·licitud enviada</button>}
                    {user.friendStatus === 'friends' && (
                        <>
                            <button>Amics</button>
                            <button>Anar al xat</button>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
