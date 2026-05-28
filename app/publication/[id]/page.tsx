'use client'
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import ContentMenu from "@/components/ui/ContentMenu"

type Comment = {
    id: number
    text: string
    timestamp: string
    author: { id: number, username: string, avatarUrl: string | null }
    likeCount: number
    likedByMe: boolean
    replies: Comment[]
}

type Publication = {
    id: number
    text: string
    imageUrl: string | null
    createdAt: string
    author: { id: number, username: string, avatarUrl: string | null }
    likeCount: number
    likedByMe: boolean
    tags: { id: number, username: string }[]
    comments: Comment[]
}

export default function PublicationPage() {
    const { id } = useParams()
    const { data: session } = useSession()
    const [pub, setPub] = useState<Publication | null>(null)
    const [commentText, setCommentText] = useState("")
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [taggedIds, setTaggedIds] = useState<number[]>([])
    const [friends, setFriends] = useState<{ id: number, username: string }[]>([])
    const [friendSearch, setFriendSearch] = useState("")

    useEffect(() => {
        fetch(`/api/publication/${id}`)
            .then(res => res.json())
            .then(setPub)
        fetch('/api/friends').then(res => res.json()).then(data => { if (Array.isArray(data)) setFriends(data) })
    }, [id])

    async function handleLike() {
        if (!pub) return
        await fetch('/api/publications/like', {
            method: pub.likedByMe ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicationId: pub.id })
        })
        setPub(prev => prev ? {
            ...prev,
            likedByMe: !prev.likedByMe,
            likeCount: prev.likedByMe ? prev.likeCount - 1 : prev.likeCount + 1
        } : prev)
    }

    async function handleComment() {
        if (!commentText.trim() || !pub) return
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: commentText,
                publicationId: replyingTo ? null : pub.id,
                commentId: replyingTo ?? null,
                taggedIds
            })
        })
        const newComment = await res.json()
        setCommentText("")
        setTaggedIds([])
        setFriendSearch("")

        if (replyingTo) {
            // Afegir la resposta al comentari pare
            setPub(prev => prev ? {
                ...prev,
                comments: prev.comments.map(c =>
                    c.id === replyingTo
                        ? { ...c, replies: [...c.replies, { ...newComment, likeCount: 0, likedByMe: false, replies: [] }] }
                        : c
                )
            } : prev)
        } else {
            // Afegir el comentari a la llista
            setPub(prev => prev ? {
                ...prev,
                comments: [...prev.comments, { ...newComment, likeCount: 0, likedByMe: false, replies: [] }]
            } : prev)
        }
        setReplyingTo(null)
    }

    if (!pub) return <p className="text-center mt-10 text-gray-400">Carregant...</p>

    return (
        <div className="page">
            <div className="card flex flex-col gap-3">

                {/* Capcalera */}
                <div className="flex items-center gap-3">
                    <Link href={`/user/${pub.author.id}`}>
                        <img src={pub.author.avatarUrl ?? "/img/profile.png"} alt={pub.author.username} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                    </Link>
                    <div className="flex-1">
                        <Link href={`/user/${pub.author.id}`} className="font-semibold text-sm hover:text-[#FF4655] transition-colors">@{pub.author.username}</Link>
                        <p className="text-xs text-gray-400">{new Date(pub.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ContentMenu
                        isOwner={session?.user?.id === String(pub.author.id)}
                        authorId={pub.author.id}
                        publicationId={pub.id}
                        currentText={pub.text}
                        onDelete={() => window.history.back()}
                        onEdit={newText => setPub(prev => prev ? { ...prev, text: newText } : prev)}
                    />
                </div>

                {/* Text i imatge */}
                <p className="text-sm">{pub.text}</p>
                {pub.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {pub.tags.map(t => (
                            <Link key={t.id} href={`/user/${t.id}`} className="text-xs text-[#FF4655] font-medium hover:underline">@{t.username}</Link>
                        ))}
                    </div>
                )}
                {pub.imageUrl && <img src={pub.imageUrl} alt="publicació" className="rounded-lg w-full object-cover max-h-72" />}

                {/* Likes */}
                <div className="flex gap-4 text-sm text-gray-400 pt-1 border-t border-gray-50">
                    <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors hover:text-[#FF4655] ${pub.likedByMe ? "text-[#FF4655]" : ""}`}>
                        {pub.likedByMe ? "♥" : "♡"} {pub.likeCount}
                    </button>
                    <span className="flex items-center gap-1.5">💬 {pub.comments.length}</span>
                </div>

                {/* Comentaris */}
                <div className="flex flex-col gap-3 border-t border-gray-50 pt-3">
                    {pub.comments.map(comment => (
                        <div key={comment.id} className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <Link href={`/user/${comment.author.id}`}>
                                        <img src={comment.author.avatarUrl ?? "/img/profile.png"} alt={comment.author.username} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                    </Link>
                                    <div className="flex-1">
                                        <Link href={`/user/${comment.author.id}`} className="text-sm font-semibold hover:text-[#FF4655] transition-colors">@{comment.author.username}</Link>
                                        <p className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <ContentMenu
                                        isOwner={session?.user?.id === String(comment.author.id)}
                                        authorId={comment.author.id}
                                        commentId={comment.id}
                                        currentText={comment.text}
                                        onDelete={() => setPub(prev => prev ? { ...prev, comments: prev.comments.filter(c => c.id !== comment.id) } : prev)}
                                        onEdit={newText => setPub(prev => prev ? { ...prev, comments: prev.comments.map(c => c.id === comment.id ? { ...c, text: newText } : c) } : prev)}
                                    />
                                </div>
                                <p className="text-sm">{comment.text}</p>
                                <button onClick={() => setReplyingTo(comment.id)} className="self-start text-xs text-gray-400 hover:text-[#FF4655] transition-colors">Respondre</button>
                            </div>
                            {comment.replies.length > 0 && (
                                <div className="ml-6 flex flex-col gap-2">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="flex flex-col gap-2 bg-gray-100 rounded-xl p-3">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/user/${reply.author.id}`}>
                                                    <img src={reply.author.avatarUrl ?? "/img/profile.png"} alt={reply.author.username} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                                                </Link>
                                                <div className="flex-1">
                                                    <Link href={`/user/${reply.author.id}`} className="text-sm font-semibold hover:text-[#FF4655] transition-colors">@{reply.author.username}</Link>
                                                    <p className="text-xs text-gray-400">{new Date(reply.timestamp).toLocaleDateString()}</p>
                                                </div>
                                                <ContentMenu
                                                    isOwner={session?.user?.id === String(reply.author.id)}
                                                    authorId={reply.author.id}
                                                    commentId={reply.id}
                                                    currentText={reply.text}
                                                    onDelete={() => setPub(prev => prev ? { ...prev, comments: prev.comments.map(c => c.id === comment.id ? { ...c, replies: c.replies.filter(r => r.id !== reply.id) } : c) } : prev)}
                                                    onEdit={newText => setPub(prev => prev ? { ...prev, comments: prev.comments.map(c => c.id === comment.id ? { ...c, replies: c.replies.map(r => r.id === reply.id ? { ...r, text: newText } : r) } : c) } : prev)}
                                                />
                                            </div>
                                            <p className="text-sm">{reply.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Camp per escriure comentari */}
                <div className="flex flex-col gap-2 border-t border-gray-50 pt-3">
                    {replyingTo && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Responent a un comentari</span>
                            <button onClick={() => setReplyingTo(null)} className="text-[#FF4655] hover:opacity-70">✕</button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleComment()}
                            placeholder={replyingTo ? "Escriu una resposta..." : "Escriu un comentari..."}
                            className="input"
                        />
                        <button onClick={handleComment} className="btn btn-primary px-4">Enviar</button>
                    </div>
                    {/* Etiquetar amics */}
                    <input
                        type="text"
                        placeholder="Etiquetar un amic..."
                        value={friendSearch}
                        onChange={e => setFriendSearch(e.target.value)}
                        className="input text-sm"
                    />
                    {friendSearch && (
                        <ul className="card p-0 overflow-hidden divide-y divide-gray-50">
                            {friends.filter(f => f.username.toLowerCase().includes(friendSearch.toLowerCase())).length === 0 && (
                                <li className="px-3 py-2 text-sm text-gray-400">Cap resultat</li>
                            )}
                            {friends.filter(f => f.username.toLowerCase().includes(friendSearch.toLowerCase())).map(f => (
                                <li key={f.id}
                                    onClick={() => { setTaggedIds(prev => prev.includes(f.id) ? prev.filter(t => t !== f.id) : [...prev, f.id]); setFriendSearch("") }}
                                    className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm transition-colors hover:bg-gray-50 ${taggedIds.includes(f.id) ? 'bg-[#fff0f1] text-[#FF4655]' : ''}`}>
                                    <span>@{f.username}</span>
                                    {taggedIds.includes(f.id) && <span className="font-bold">✓</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                    {taggedIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {taggedIds.map(id => {
                                const f = friends.find(fr => fr.id === id)
                                return (
                                    <span key={id} className="bg-[#fff0f1] text-[#FF4655] text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#fecdd3]">
                                        @{f?.username}
                                        <button onClick={() => setTaggedIds(prev => prev.filter(t => t !== id))}>×</button>
                                    </span>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
