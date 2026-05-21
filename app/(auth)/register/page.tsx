'use client'
import { useState, useEffect } from 'react'

type Option = { id: number, name: string, desc: string }

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Opcions del formulari
    const [ranks, setRanks] = useState<Option[]>([])
    const [regions, setRegions] = useState<Option[]>([])
    const [roles, setRoles] = useState<Option[]>([])
    
    //Ids que es recullen per al registre
    const [rankId, setRankId] = useState('')
    const [regionId, setRegionId] = useState('')
    const [roleIds, setRoleIds] = useState<number[]>([])

    // Carregar opcions de la BD
    useEffect(() => {
        fetch('/api/ranks').then(res => res.json()).then(setRanks)
        fetch('/api/regions').then(res => res.json()).then(setRegions)
        fetch('/api/roles').then(res => res.json()).then(setRoles)
    }, [])

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError('')
        setSuccess(false)
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

    return (
        <div>
            <h1>REGISTRE</h1>
            {error && <p>{error}</p>}
            {success && <p>Registre completat amb èxit!</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Usuari" value={username} onChange={(e) => setUsername(e.target.value)} required /><br />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Contrasenya" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />

                {/* Selecció de rang */}
                <select value={rankId} onChange={(e) => setRankId(e.target.value)} required>
                    <option value="">Selecciona un rang</option>
                    {ranks.map(r => <option key={r.id} value={r.id} title={r.desc}>{r.name}</option>)}
                </select><br />

                {/* Selecció de regió */}
                <select value={regionId} onChange={(e) => setRegionId(e.target.value)} required>
                    <option value="">Selecciona una regió</option>
                    {regions.map(r => <option key={r.id} value={r.id} title={r.desc}>{r.name}</option>)}
                </select><br />

                {/* Selecció de rol (checkboxes) */}
                {roles.map(r => (
                    <label key={r.id} title={r.desc}>
                        <input
                            type="checkbox"
                            value={r.id}
                            checked={roleIds.includes(r.id)}
                            onChange={(e) => {
                                if (e.target.checked) setRoleIds([...roleIds, r.id])
                                else setRoleIds(roleIds.filter(id => id !== r.id))
                            }}
                        />
                        {r.name}
                    </label>
                ))}<br />

                <button type="submit">Registrar-se</button>
                <a href="/login">Ja tens un compte? Inicia sessió</a>
            </form>
        </div>
    )
}
