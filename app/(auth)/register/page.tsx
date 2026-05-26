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
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center flex flex-col gap-4">
                <p className="text-[#FF4655] font-medium">Registre completat amb èxit! ✓</p>
                <Link href="/login" className="text-[#FF4655] font-medium hover:underline text-sm">Inicia sessió</Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2">
                    <img src="/img/logo.png" alt="Social Valorant" className="h-14 w-14 object-contain" />
                    <h1 className="text-xl font-bold text-[#FF4655] tracking-tight">SOCIAL VALORANT</h1>
                    <p className="text-sm text-gray-400">Crea el teu compte</p>
                </div>
                {error && <p className="text-[#FF4655] text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input type="text" placeholder="Usuari" value={username} onChange={e => setUsername(e.target.value)} required className="input" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
                    <input type="password" placeholder="Contrasenya" value={password} onChange={e => setPassword(e.target.value)} required className="input" />

                    <select value={rankId} onChange={e => setRankId(e.target.value)} required className="input">
                        <option value="">Selecciona un rang</option>
                        {ranks.map(r => <option key={r.id} value={r.id} title={r.desc}>{r.name}</option>)}
                    </select>

                    <select value={regionId} onChange={e => setRegionId(e.target.value)} required className="input">
                        <option value="">Selecciona una regió</option>
                        {regions.map(r => <option key={r.id} value={r.id} title={r.desc}>{r.name}</option>)}
                    </select>

                    {roles.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-gray-700">Rols</p>
                            {roles.map(r => (
                                <label key={r.id} title={r.desc} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600">
                                    <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} className="w-4 h-4 accent-[#FF4655]" />
                                    {r.name}
                                </label>
                            ))}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full mt-1">Registrar-se</button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Ja tens compte?{" "}
                    <Link href="/login" className="text-[#FF4655] font-medium hover:underline">Inicia sessió</Link>
                </p>
            </div>
        </div>
    )
}
