'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Option = { id: number, name: string, desc: string }

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [ranks, setRanks] = useState<Option[]>([])
    const [regions, setRegions] = useState<Option[]>([])
    const [roles, setRoles] = useState<Option[]>([])
    const [rankId, setRankId] = useState('')
    const [regionId, setRegionId] = useState('')
    const [roleIds, setRoleIds] = useState<number[]>([])

    useEffect(() => {
        fetch('/api/ranks').then(res => res.json()).then(setRanks)
        fetch('/api/regions').then(res => res.json()).then(setRegions)
        fetch('/api/roles').then(res => res.json()).then(setRoles)
    }, [])

    function toggleRole(id: number) {
        setRoleIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, rankId: Number(rankId), regionId: Number(regionId), roleIds })
        })
        if (!res.ok) {
            const data = await res.json()
            setError(data.error)
            return
        }
        setSuccess(true)
    }

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-sm text-center flex flex-col gap-4">
                <p className="text-green-500 font-medium">Registre completat amb èxit! ✓</p>
                <Link href="/login" className="text-blue-500 hover:underline text-sm">Inicia sessió</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-sm flex flex-col gap-5">
                <h1 className="text-2xl font-bold text-center">Registre</h1>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input type="text" placeholder="Usuari" value={username} onChange={e => setUsername(e.target.value)} required className="border rounded px-3 py-2 text-sm" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border rounded px-3 py-2 text-sm" />
                    <input type="password" placeholder="Contrasenya" value={password} onChange={e => setPassword(e.target.value)} required className="border rounded px-3 py-2 text-sm" />

                    <select value={rankId} onChange={e => setRankId(e.target.value)} required className="border rounded px-3 py-2 text-sm">
                        <option value="">Selecciona un rang</option>
                        {ranks.map(r => <option key={r.id} value={r.id} title={r.desc}>{r.name}</option>)}
                    </select>

                    <select value={regionId} onChange={e => setRegionId(e.target.value)} required className="border rounded px-3 py-2 text-sm">
                        <option value="">Selecciona una regió</option>
                        {regions.map(r => <option key={r.id} value={r.id} title={r.desc}>{r.name}</option>)}
                    </select>

                    {/* Rols: selecció múltiple amb checkboxes */}
                    {roles.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium">Rols</p>
                            {roles.map(r => (
                                <label key={r.id} title={r.desc} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} className="w-4 h-4" />
                                    {r.name}
                                </label>
                            ))}
                        </div>
                    )}

                    <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 text-sm hover:bg-blue-600">
                        Registrar-se
                    </button>
                </form>
                <p className="text-sm text-center text-gray-500">
                    Ja tens compte?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">Inicia sessió</Link>
                </p>
            </div>
        </div>
    )
}
