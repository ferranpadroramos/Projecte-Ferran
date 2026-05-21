'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"

// TODO: substituir per crida a API quan la BD estigui llesta
const MOCK_FRIENDS = [
    { id: 1, username: "anna99" },
    { id: 2, username: "marc_dev" },
    { id: 3, username: "laura_gx" },
    { id: 4, username: "jordi22" },
]

export default function PublicatePage() {
    const [text, setText] = useState("")
    const [error, setError] = useState("")
    // URL de previsualització de la imatge seleccionada
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    // Fitxer d'imatge seleccionat
    const [imageFile, setImageFile] = useState<File | null>(null)
    // Llista d'ids d'amics etiquetats
    const [taggedIds, setTaggedIds] = useState<number[]>([])
    // Text del cercador d'amics
    const [friendSearch, setFriendSearch] = useState("")
    const router = useRouter()

    // Filtrar amics pel text del cercador
    const filteredFriends = MOCK_FRIENDS.filter(f =>
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
        <div className="max-w-xl mx-auto mt-10 p-4">
            <h1 className="text-xl font-bold mb-4">Nova publicació</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Textarea per escriure el text */}
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Què vols publicar?"
                    rows={4}
                    className="border rounded p-2 resize-none"
                />

                {/* Secció d'imatge */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm">Imatge (opcional)</label>
                    {/* Mostrar previsualització si hi ha imatge seleccionada */}
                    {imagePreview ? (
                        <div className="relative w-fit">
                            <img src={imagePreview} alt="preview" className="max-h-48 rounded border object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center"
                            >✕</button>
                        </div>
                    ) : (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-sm"
                        />
                    )}
                </div>

                {/* Secció d'etiquetes d'amics */}
                <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm">Etiquetar amics (opcional)</label>
                    <input
                        type="text"
                        placeholder="Cerca un amic..."
                        value={friendSearch}
                        onChange={e => setFriendSearch(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                    />
                    {/* Llista d'amics filtrats */}
                    {friendSearch && (
                        <ul className="border rounded divide-y text-sm">
                            {filteredFriends.length === 0 && (
                                <li className="px-3 py-2 text-gray-400">Cap resultat</li>
                            )}
                            {filteredFriends.map(friend => (
                                <li
                                    key={friend.id}
                                    onClick={() => toggleTag(friend.id)}
                                    className={`px-3 py-2 cursor-pointer flex justify-between items-center hover:bg-gray-50 ${taggedIds.includes(friend.id) ? "bg-blue-50" : ""}`}
                                >
                                    <span>@{friend.username}</span>
                                    {/* Checkmark si està etiquetat */}
                                    {taggedIds.includes(friend.id) && <span className="text-blue-500">✓</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                    {/* Mostrar els amics etiquetats */}
                    {taggedIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {taggedIds.map(id => {
                                const friend = MOCK_FRIENDS.find(f => f.id === id)
                                return (
                                    <span key={id} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        @{friend?.username}
                                        <button type="button" onClick={() => toggleTag(id)}>✕</button>
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">
                    Publicar
                </button>
            </form>
        </div>
    )
}
