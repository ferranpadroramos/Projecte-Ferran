'use client'
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import ConfirmModal from "./ConfirmModal"
import ReportModal from "./ReportModal"

type Props = {
    isOwner: boolean
    authorId: number
    publicationId?: number
    commentId?: number
    currentText: string
    onDelete: () => void
    onEdit: (newText: string) => void
}

export default function ContentMenu({ isOwner, authorId, publicationId, commentId, currentText, onDelete, onEdit }: Props) {
    const [open, setOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [editText, setEditText] = useState(currentText)
    const menuRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Tancar el menú si es clica fora
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    async function handleDelete() {
        const endpoint = commentId ? `/api/comments/${commentId}` : `/api/publications/${publicationId}`
        await fetch(endpoint, { method: "DELETE" })
        setShowConfirm(false)
        onDelete()
    }

    async function handleEdit() {
        if (!editText.trim()) return
        const endpoint = commentId ? `/api/comments/${commentId}` : `/api/publications/${publicationId}`
        await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: editText }) })
        setShowEdit(false)
        onEdit(editText)
    }

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                >
                    ···
                </button>

                {open && (
                    <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-40 overflow-hidden py-1">
                        {isOwner ? (
                            <>
                                <button onClick={() => { setOpen(false); setShowEdit(true) }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <span>✏️</span> Editar
                                </button>
                                <button onClick={() => { setOpen(false); setShowConfirm(true) }} className="w-full text-left px-4 py-2.5 text-sm text-[#FF4655] hover:bg-[#fff0f1] flex items-center gap-2">
                                    <span>🗑️</span> Esborrar
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { setOpen(false); router.push(`/user/${authorId}`) }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <span>👤</span> Veure perfil
                                </button>
                                <button onClick={() => { setOpen(false); setShowReport(true) }} className="w-full text-left px-4 py-2.5 text-sm text-[#FF4655] hover:bg-[#fff0f1] flex items-center gap-2">
                                    <span>⚠️</span> Reportar
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {showConfirm && (
                <ConfirmModal
                    message={commentId ? "Vols esborrar aquest comentari?" : "Vols esborrar aquesta publicació?"}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            {showEdit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-xl">
                        <h2 className="font-semibold text-center">Editar</h2>
                        <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} className="input resize-none" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowEdit(false)} className="btn btn-ghost flex-1">Cancel·lar</button>
                            <button onClick={handleEdit} className="btn btn-primary flex-1">Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {showReport && (
                <ReportModal publicationId={publicationId} commentId={commentId} onClose={() => setShowReport(false)} />
            )}
        </>
    )
}
