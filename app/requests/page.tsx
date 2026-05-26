'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ConfirmModal from '@/components/ui/ConfirmModal'

type Request = {
    id: number
    sender: {
        id: number
        username: string
        avatarUrl: string | null
        rank: { id: number, name: string } | null
    }
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [rejectId, setRejectId] = useState<number | null>(null)

    useEffect(() => {
        fetch('/api/friendship/requests')
            .then(res => res.json())
            .then(setRequests)
    }, [])

    async function handleAccept(id: number) {
        await fetch('/api/friendship/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitudId: id })
        })
        setRequests(prev => prev.filter(r => r.id !== id))
    }

    async function handleReject(id: number) {
        await fetch('/api/friendship/requests', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ solicitudId: id })
        })
        setRequests(prev => prev.filter(r => r.id !== id))
        setRejectId(null)
    }

    return (
        <div className="page">
            <h1 className="text-xl font-bold">Sol·licituds d'amistat</h1>
            {requests.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-10">No tens sol·licituds pendents</p>
            )}
            {requests.map(r => (
                <div key={r.id} className="card flex items-center gap-3">
                    <Link href={`/user/${r.sender.id}`}>
                        <img src={r.sender.avatarUrl ?? '/img/profile.png'} alt={r.sender.username} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                    </Link>
                    <div className="flex-1">
                        <Link href={`/user/${r.sender.id}`} className="font-semibold text-sm hover:text-[#FF4655] transition-colors">
                            @{r.sender.username}
                        </Link>
                        {r.sender.rank && <p className="text-xs text-gray-400">{r.sender.rank.name}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleAccept(r.id)} className="btn btn-primary text-sm px-4 py-1.5">Acceptar</button>
                        <button onClick={() => setRejectId(r.id)} className="btn btn-ghost text-sm px-4 py-1.5">Rebutjar</button>
                    </div>
                </div>
            ))}
            {rejectId && (
                <ConfirmModal
                    message="Vols rebutjar aquesta sol·licitud?"
                    onConfirm={() => handleReject(rejectId)}
                    onCancel={() => setRejectId(null)}
                />
            )}
        </div>
    )
}
