'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import ContentMenu from "@/components/ui/ContentMenu"

type Publication = {
    id: number
    text: string
    imageUrl: string | null
    createdAt: string
    author: { id: number, username: string, avatarUrl: string | null }
    likeCount: number
    commentCount: number
    likedByMe: boolean
    tags: string[]
}

export default function HomePage() {
    const { data: session } = useSession()
    const [publications, setPublications] = useState<Publication[]>([])

    // Carregar publicacions de l'API
    useEffect(() => {
        fetch('/api/publications')
            .then(res => res.json())
            .then(setPublications)
    }, [])

    async function handleLike(id: number, likedByMe: boolean) {
        await fetch('/api/publications/like', {
            method: likedByMe ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicationId: id })
        })
        setPublications(publications.map(p =>
            p.id === id ? { ...p, likedByMe: !likedByMe, likeCount: likedByMe ? p.likeCount - 1 : p.likeCount + 1 } : p
        ))
    }

    // Treure la publicació de la llista un cop esborrada
    function handleDelete(id: number) {
        setPublications(prev => prev.filter(p => p.id !== id))
    }

    return (
        <div className="max-w-xl mx-auto mt-6 flex flex-col gap-4 px-4">
            {publications.map(pub => (
                <div key={pub.id} className="border rounded-xl p-4 flex flex-col gap-3 shadow-sm">

                    {/* Capçalera: avatar + nom + data + menú */}
                    <div className="flex items-center gap-3">
                        <Link href={`/user/${pub.author.id}`}>
                            <img src={pub.author.avatarUrl ?? "/img/profile.png"} alt={pub.author.username} className="w-10 h-10 rounded-full object-cover border" />
                        </Link>
                        <div className="flex-1">
                            <Link href={`/user/${pub.author.id}`} className="font-semibold hover:underline">
                                @{pub.author.username}
                            </Link>
                            <p className="text-xs text-gray-400">{new Date(pub.createdAt).toLocaleDateString()}</p>
                        </div>
                        {/* Menú d'opcions (esborrar si és propi, reportar si no) */}
                        <ContentMenu
                            isOwner={session?.user?.id === String(pub.author.id)}
                            publicationId={pub.id}
                            onDelete={() => handleDelete(pub.id)}
                        />
                    </div>

                    {/* Text de la publicació */}
                    <p className="text-sm">{pub.text}</p>

                    {/* Etiquetes */}
                    {pub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {pub.tags.map(tag => (
                                <span key={tag} className="text-xs text-blue-500">@{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Imatge si n'hi ha */}
                    {pub.imageUrl && (
                        <img src={pub.imageUrl} alt="publicació" className="rounded-lg w-full object-cover max-h-64" />
                    )}

                    {/* Accions: like i comentaris */}
                    <div className="flex gap-4 text-sm text-gray-500">
                        <button onClick={() => handleLike(pub.id, pub.likedByMe)} className={`flex items-center gap-1 hover:text-red-500 ${pub.likedByMe ? "text-red-500" : ""}`}>
                            {pub.likedByMe ? "❤️" : "🤍"} {pub.likeCount}
                        </button>
                        <span className="flex items-center gap-1">💬 {pub.commentCount}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
