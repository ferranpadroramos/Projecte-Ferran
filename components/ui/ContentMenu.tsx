'use client'
import { useState, useRef, useEffect } from "react"
import ConfirmModal from "./ConfirmModal"
import ReportModal from "./ReportModal"

type Props = {
    isOwner: boolean
    publicationId?: number
    commentId?: number
    onDelete: () => void
}

export default function ContentMenu({ isOwner, publicationId, commentId, onDelete }: Props) {
    const [open, setOpen] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

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
                    <div className="absolute right-0 top-7 bg-white border rounded-lg shadow-md z-10 min-w-32 overflow-hidden">
                        {isOwner ? (
                            <button
                                onClick={() => { setOpen(false); setShowConfirm(true) }}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                                🗑️ Esborrar
                            </button>
                        ) : (
                            <button
                                onClick={() => { setOpen(false); setShowReport(true) }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                ⚠️ Reportar
                            </button>
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
