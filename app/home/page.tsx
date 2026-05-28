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
            .then(data => { if (Array.isArray(data)) setPublications(data) })
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
        <div className="page">
            {publications.map(pub => (
                <div key={pub.id} className="card flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={`/user/${pub.author.id}`}>
                            <img src={pub.author.avatarUrl ?? "/img/profile.png"} alt={pub.author.username} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        </Link>
                        <div className="flex-1">
                            <Link href={`/user/${pub.author.id}`} className="font-semibold text-sm hover:text-[#FF4655] transition-colors">
                                @{pub.author.username}
                            </Link>
                            <p className="text-xs text-gray-400">{new Date(pub.createdAt).toLocaleDateString()}</p>
                        </div>
                        <ContentMenu
                            isOwner={session?.user?.id === String(pub.author.id)}
                            authorId={pub.author.id}
                            publicationId={pub.id}
                            currentText={pub.text}
                            onDelete={() => handleDelete(pub.id)}
                            onEdit={newText => setPublications(prev => prev.map(p => p.id === pub.id ? { ...p, text: newText } : p))}
                        />
                    </div>
                    <p className="text-sm">{pub.text}</p>
                    {pub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {pub.tags.map(tag => (
                                <span key={tag} className="text-xs text-[#FF4655] font-medium">@{tag}</span>
                            ))}
                        </div>
                    )}
                    {pub.imageUrl && (
                        <img src={pub.imageUrl} alt="publicació" className="rounded-lg w-full object-cover max-h-64" />
                    )}
                    <div className="flex gap-4 text-sm text-gray-400 pt-1 border-t border-gray-50">
                        <button
                            onClick={() => handleLike(pub.id, pub.likedByMe)}
                            className={`flex items-center gap-1.5 transition-colors hover:text-[#FF4655] ${pub.likedByMe ? "text-[#FF4655]" : ""}`}
                        >
                            {pub.likedByMe ? "♥" : "♡"} {pub.likeCount}
                        </button>
                        <Link href={`/publication/${pub.id}`} className="flex items-center gap-1.5 hover:text-[#FF4655] transition-colors">
                            💬 {pub.commentCount}
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    )
}
