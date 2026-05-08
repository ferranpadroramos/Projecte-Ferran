'use client'
import { useEffect, useState } from 'react'

type Request = {
    id: number
    sender: {
        id: number
        username: string
        rank: { id: number, name: string } | null
    }
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])

    useEffect(() => {
        fetch('/api/friend-request')
            .then(res => res.json())
            .then(setRequests)
    }, [])

    async function handleAccept(id: number) {
        await fetch('/api/friendship/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitudId: id })
        })
        setRequests(requests.filter(r => r.id !== id))
    }

    async function handleReject(id: number) {
        await fetch('/api/friendship/accept', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitudId: id })
        })
        setRequests(requests.filter(r => r.id !== id))
    }

    return (
        <div>
            <h1>SOL·LICITUDS</h1>
            {requests.length === 0 && <p>No tens sol·licituds pendents</p>}
            {requests.map(r => (
                <div key={r.id}>
                    <img src="/img/profile.png" alt="perfil" />
                    <span>{r.sender.username}</span>
                    {r.sender.rank && (
                        <img src={`/img/ranks/${r.sender.rank.id}.png`} alt={r.sender.rank.name} />
                    )}
                    <button onClick={() => handleAccept(r.id)}>✓</button>
                    <button onClick={() => handleReject(r.id)}>✗</button>
                </div>
            ))}
        </div>
    )
}
