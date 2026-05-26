'use client'
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

type Option = { id: number, name: string }

export default function SettingsPage() {
    const { data: session } = useSession()
    const [username, setUsername] = useState(session?.user?.name ?? "")
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [rankId, setRankId] = useState("")
    const [regionId, setRegionId] = useState("")
    const [roleIds, setRoleIds] = useState<number[]>([])
    const [ranks, setRanks] = useState<Option[]>([])
    const [regions, setRegions] = useState<Option[]>([])
    const [roles, setRoles] = useState<Option[]>([])
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        fetch('/api/ranks').then(r => r.json()).then(setRanks)
        fetch('/api/regions').then(r => r.json()).then(setRegions)
        fetch('/api/roles').then(r => r.json()).then(setRoles)
        // Carregar dades actuals de l'usuari
        if (session?.user?.id) {
            fetch(`/api/user/${session.user.id}`).then(r => r.json()).then(data => {
                setRankId(String(data.rank?.id ?? ""))
                setRegionId(String(data.region?.id ?? ""))
                setRoleIds(data.role?.map((r: { id: number }) => r.id) ?? [])
            })
        }
    }, [session?.user?.id])

    function toggleRole(id: number) {
        setRoleIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
    }

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setSuccess("")

        let avatarUrl: string | null = null
        if (avatarFile) {
            const formData = new FormData()
            formData.append("file", avatarFile)
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
            if (!uploadRes.ok) { setError("Error en pujar la imatge"); return }
            avatarUrl = (await uploadRes.json()).url
        }

        const res = await fetch(`/api/user/${session?.user?.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, avatarUrl, rankId: Number(rankId), regionId: Number(regionId), roleIds })
        })

        if (!res.ok) { setError("Error en guardar els canvis"); return }
        setSuccess("Canvis guardats correctament")
    }

    return (
        <div className="page">
            <h1 className="text-xl font-bold">Configuració</h1>

            <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
                {/* Foto de perfil */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm text-gray-700">Foto de perfil</label>
                    <div className="flex items-center gap-4">
                        <img src={avatarPreview ?? "/img/profile.png"} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm text-gray-500 file:mr-3 file:btn file:btn-secondary file:cursor-pointer" />
                    </div>
                </div>

                {/* Nom d'usuari */}
                <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-gray-700">Nom d'usuari</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input" />
                </div>

                {/* Rang */}
                <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-gray-700">Rang</label>
                    <select value={rankId} onChange={e => setRankId(e.target.value)} className="input">
                        <option value="">Selecciona un rang</option>
                        {ranks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                {/* Regió */}
                <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm text-gray-700">Regió</label>
                    <select value={regionId} onChange={e => setRegionId(e.target.value)} className="input">
                        <option value="">Selecciona una regió</option>
                        {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>

                {/* Rols */}
                {roles.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <label className="font-medium text-sm text-gray-700">Rols</label>
                        {roles.map(r => (
                            <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600">
                                <input type="checkbox" checked={roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} className="w-4 h-4 accent-[#FF4655]" />
                                {r.name}
                            </label>
                        ))}
                    </div>
                )}

                {error && <p className="text-[#FF4655] text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}

                <button type="submit" className="btn btn-primary w-full">Guardar canvis</button>
            </form>
        </div>
    )
}
