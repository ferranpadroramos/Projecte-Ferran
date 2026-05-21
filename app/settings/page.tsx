'use client'
import { useState } from "react"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
    const { data: session } = useSession()
    const [username, setUsername] = useState(session?.user?.name ?? "")
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    // Quan l'usuari selecciona una nova foto de perfil
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

        // Si hi ha nova foto, pujar-la a Cloudinary
        if (avatarFile) {
            const formData = new FormData()
            formData.append("file", avatarFile)
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
            if (!uploadRes.ok) {
                setError("Error en pujar la imatge")
                return
            }
            const uploadData = await uploadRes.json()
            avatarUrl = uploadData.url
        }

        // Enviar els canvis a la API (pendent d'implementar)
        const res = await fetch(`/api/user/${session?.user?.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, avatarUrl })
        })

        if (!res.ok) {
            setError("Error en guardar els canvis")
            return
        }

        setSuccess("Canvis guardats correctament")
    }

    return (
        <div className="max-w-md mx-auto mt-10 px-4 flex flex-col gap-6">
            <h1 className="text-xl font-bold">Configuració</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Foto de perfil */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm">Foto de perfil</label>
                    <div className="flex items-center gap-4">
                        <img
                            src={avatarPreview ?? "/img/profile.png"}
                            alt="avatar"
                            className="w-16 h-16 rounded-full object-cover border"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Nom d'usuari */}
                <div className="flex flex-col gap-1">
                    <label className="font-medium text-sm">Nom d'usuari</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                    />
                </div>

                {/* Missatges de feedback */}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 text-sm">
                    Guardar canvis
                </button>
            </form>
        </div>
    )
}
