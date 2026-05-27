'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Friend = { id: number, username: string }

export default function PublicatePage() {
    const [text, setText] = useState("")
    const [error, setError] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [taggedIds, setTaggedIds] = useState<number[]>([])
    const [friendSearch, setFriendSearch] = useState("")
    const [friends, setFriends] = useState<Friend[]>([])
    const router = useRouter()

    // Carregar amics reals de l'API
    useEffect(() => {
        fetch('/api/friends').then(res => res.json()).then(setFriends)
    }, [])

    const filteredFriends = friends.filter(f =>
        f.username.toLowerCase().includes(friendSearch.toLowerCase())
    )

    // Afegir o treure un amic de la llista d'etiquetats
    function toggleTag(id: number) {
        setTaggedIds(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        )
    }

    // Quan l'usuari selecciona una imatge, generar previsualització
    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file)) // URL temporal per previsualitzar
    }

    // Treure la imatge seleccionada
    function removeImage() {
        setImageFile(null)
        setImagePreview(null)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        let imageUrl: string | null = null

        // Si hi ha imatge, pujar-la primer a Cloudinary
        if (imageFile) {
            const formData = new FormData()
            formData.append("file", imageFile)
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
            if (!uploadRes.ok) {
                setError("Error en pujar la imatge")
                return
            }
            const uploadData = await uploadRes.json()
            imageUrl = uploadData.url
        }

        // Crear la publicació amb text, imatge i etiquetes
        const res = await fetch("/api/publications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, imageUrl, taggedIds })
        })

        if (!res.ok) {
            const data = await res.json()
            setError(data.error)
            return
        }

        router.push("/home")
    }

    return (
        <div className="page">
            <h1 className="text-xl font-bold">Nova publicació</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Què vols publicar?"
                    rows={4}
                    className="input resize-none"
                />
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600">Imatge (opcional)</label>
                    {imagePreview ? (
                        <div className="relative w-fit">
                            <img src={imagePreview} alt="preview" className="max-h-48 rounded-lg border border-gray-200 object-cover" />
                            <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-[#FF4655] text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-[#e03040]">✕</button>
                        </div>
                    ) : (
                        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-gray-500 file:mr-3 file:btn file:btn-secondary file:cursor-pointer" />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600">Etiquetar amics (opcional)</label>
                    <input type="text" placeholder="Cerca un amic..." value={friendSearch} onChange={e => setFriendSearch(e.target.value)} className="input" />
                    {friendSearch && (
                        <ul className="card p-0 overflow-hidden divide-y divide-gray-50">
                            {filteredFriends.length === 0 && <li className="px-3 py-2 text-sm text-gray-400">Cap resultat</li>}
                            {filteredFriends.map(friend => (
                                <li key={friend.id} onClick={() => toggleTag(friend.id)}
                                    className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm transition-colors hover:bg-gray-50 ${taggedIds.includes(friend.id) ? 'bg-[#fff0f1] text-[#FF4655]' : ''}`}>
                                    <span>@{friend.username}</span>
                                    {taggedIds.includes(friend.id) && <span className="text-[#FF4655] font-bold">✓</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                    {taggedIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {taggedIds.map(id => {
                                const friend = friends.find(f => f.id === id)
                                return (
                                    <span key={id} className="bg-[#fff0f1] text-[#FF4655] text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#fecdd3]">
                                        @{friend?.username}
                                        <button type="button" onClick={() => toggleTag(id)} className="hover:opacity-70">×</button>
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </div>
                {error && <p className="text-[#FF4655] text-sm">{error}</p>}
                <button type="submit" className="btn btn-primary w-full">Publicar</button>
            </form>
        </div>
    )
}
