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
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
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
        await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: editText })
        })
        setShowEdit(false)
        onEdit(editText)
    }

    return (
        <>
            <div className="relative" ref={menuRef}>
                {/* Botó de tres punts */}
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
                >
                    ···
                </button>

                {/* Menú desplegable */}
                {open && (
                    <div className="absolute right-0 top-7 bg-white border rounded-lg shadow-md z-10 min-w-36 overflow-hidden">
                        {isOwner ? (
                            <>
                                <button
                                    onClick={() => { setOpen(false); setShowEdit(true) }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => { setOpen(false); setShowConfirm(true) }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                                >
                                    🗑️ Esborrar
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setOpen(false); router.push(`/user/${authorId}`) }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    👤 Veure perfil
                                </button>
                                <button
                                    onClick={() => { setOpen(false); setShowReport(true) }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    ⚠️ Reportar
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de confirmació d'esborrat */}
            {showConfirm && (
                <ConfirmModal
                    message={commentId ? "Vols esborrar aquest comentari?" : "Vols esborrar aquesta publicació?"}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            {/* Modal d'edició */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-lg">
                        <h2 className="font-semibold text-center">Editar</h2>
                        <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            rows={4}
                            className="border rounded p-2 resize-none text-sm"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="flex-1 border rounded px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                Cancel·lar
                            </button>
                            <button
                                onClick={handleEdit}
                                className="flex-1 bg-blue-500 text-white rounded px-4 py-2 text-sm hover:bg-blue-600"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de report */}
            {showReport && (
                <ReportModal
                    publicationId={publicationId}
                    commentId={commentId}
                    onClose={() => setShowReport(false)}
                />
            )}
        </>
    )
}
