'use client'
import { useState } from "react"
import Link from "next/link"

// TODO: substituir per crida a API quan la BD estigui llesta
const MOCK_PUBLICATIONS = [
    {
        id: 1,
        author: { id: 2, username: "anna99", avatarUrl: null },
        text: "Avui ha estat un gran dia! 🎉",
        imageUrl: null,
        likes: 12,
        comments: 3,
        tags: ["marc_dev"],
        createdAt: "Fa 2 hores"
    },
    {
        id: 2,
        author: { id: 3, username: "marc_dev", avatarUrl: null },
        text: "Nou projecte en marxa 🚀 Molt content amb els resultats",
        imageUrl: "https://placehold.co/600x300",
        likes: 8,
        comments: 1,
        tags: [],
        createdAt: "Fa 5 hores"
    },
    {
        id: 3,
        author: { id: 4, username: "laura_gx", avatarUrl: null },
        text: "Bones tardes a tothom!",
        imageUrl: null,
        likes: 4,
        comments: 0,
        tags: ["anna99", "jordi22"],
        createdAt: "Fa 1 dia"
    },
]

export default function HomePage() {
    const [liked, setLiked] = useState<number[]>([])

    function toggleLike(id: number) {
        setLiked(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
    }

    return (
        <div className="max-w-xl mx-auto mt-6 flex flex-col gap-4 px-4">
            {MOCK_PUBLICATIONS.map(pub => (
                <div key={pub.id} className="border rounded-xl p-4 flex flex-col gap-3 shadow-sm">

                    {/* Capçalera: avatar + nom + data */}
                    <div className="flex items-center gap-3">
                        <Link href={`/user/${pub.author.id}`}>
                            <img
                                src={pub.author.avatarUrl ?? "/img/profile.png"}
                                alt={pub.author.username}
                                className="w-10 h-10 rounded-full object-cover border"
                            />
                        </Link>
                        <div>
                            <Link href={`/user/${pub.author.id}`} className="font-semibold hover:underline">
                                @{pub.author.username}
                            </Link>
                            <p className="text-xs text-gray-400">{pub.createdAt}</p>
                        </div>
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
                        <button
                            onClick={() => toggleLike(pub.id)}
                            className={`flex items-center gap-1 hover:text-red-500 ${liked.includes(pub.id) ? "text-red-500" : ""}`}
                        >
                            {liked.includes(pub.id) ? "❤️" : "🤍"}
                            {pub.likes + (liked.includes(pub.id) ? 1 : 0)}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500">
                            💬 {pub.comments}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
