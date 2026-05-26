'use client'
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import ConfirmModal from "@/components/ui/ConfirmModal"

type Report = {
    id: number
    reasons: string[]
    status: string
    adminComment: string | null
    createdAt: string
    publication: { id: number, text: string } | null
    comment: { id: number, text: string, publicationId: number | null } | null
}

const REPORT_OPTIONS = ["Contingut inapropiat", "Spam", "Assetjament", "Informació falsa", "Altres"]

const STATUS_LABELS: Record<string, string> = {
    pending: "⏳ Pendent",
    accepted: "✅ Acceptat",
    rejected: "❌ Rebutjat"
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-[#fff0f1] text-[#FF4655]"
}

export default function ReportsPage() {
    const { data: session } = useSession()
    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("pending")
    const [deleteId, setDeleteId] = useState<number | null>(null)
    // Estat d'edició
    const [editId, setEditId] = useState<number | null>(null)
    const [editReasons, setEditReasons] = useState<string[]>([])
    // Per admins: modal de resposta
    const [activeReport, setActiveReport] = useState<Report | null>(null)
    const [adminComment, setAdminComment] = useState("")
    const [deleteContent, setDeleteContent] = useState(false)
    const [notifyCreator, setNotifyCreator] = useState(false)
    const [notifyText, setNotifyText] = useState("")

    useEffect(() => {
        fetch("/api/reports")
            .then(res => res.json())
            .then(data => { setReports(data); setLoading(false) })
    }, [])

    async function handleDelete(id: number) {
        await fetch(`/api/reports/${id}`, { method: "DELETE" })
        setReports(prev => prev.filter(r => r.id !== id))
        setDeleteId(null)
    }

    async function handleEdit(id: number) {
        await fetch(`/api/reports/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reasons: editReasons })
        })
        setReports(prev => prev.map(r => r.id === id ? { ...r, reasons: editReasons } : r))
        setEditId(null)
    }

    async function handleAdminRespond(status: "accepted" | "rejected") {
        if (!activeReport) return
        await fetch(`/api/reports/${activeReport.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, adminComment, deleteContent, notifyCreator, notifyText })
        })
        setReports(prev => prev.map(r =>
            r.id === activeReport.id ? { ...r, status, adminComment } : r
        ))
        setActiveReport(null)
    }

    const filtered = reports.filter(r => r.status === filter)

    if (loading) return <p className="text-center mt-10 text-gray-400">Carregant...</p>

    return (
        <div className="page" style={{ maxWidth: "42rem" }}>
            <h1 className="text-xl font-bold">{isAdmin ? "Gestió de reports" : "Els meus reports"}</h1>

            {/* Filtre per estat */}
            <div className="flex gap-2">
                {["pending", "accepted", "rejected"].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? "bg-[#FF4655] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {STATUS_LABELS[s]}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-6">No hi ha reports {STATUS_LABELS[filter].toLowerCase()}</p>
            )}

            {filtered.map(report => (
                <div key={report.id} className="card flex flex-col gap-3">
                    {/* Capçalera */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[report.status]}`}>
                            {STATUS_LABELS[report.status]}
                        </span>
                    </div>

                    {/* Motius */}
                    {editId === report.id ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">Edita els motius:</p>
                            {REPORT_OPTIONS.map(opt => (
                                <label key={opt} className={`flex items-center gap-3 text-sm cursor-pointer px-3 py-2 rounded-lg border transition-colors ${editReasons.includes(opt) ? 'border-[#FF4655] bg-[#fff0f1] text-[#FF4655]' : 'border-gray-200'}`}>
                                    <input type="checkbox" checked={editReasons.includes(opt)} onChange={() => setEditReasons(prev => prev.includes(opt) ? prev.filter(r => r !== opt) : [...prev, opt])} className="w-4 h-4 accent-[#FF4655]" />
                                    {opt}
                                </label>
                            ))}
                            <div className="flex gap-2 mt-1">
                                <button onClick={() => setEditId(null)} className="btn btn-ghost flex-1">Cancel·lar</button>
                                <button onClick={() => handleEdit(report.id)} className="btn btn-primary flex-1">Guardar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {report.reasons.map(r => (
                                <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                            ))}
                        </div>
                    )}

                    {/* Contingut reportat */}
                    {report.publication && (
                        <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-start gap-2">
                            <p className="text-sm text-gray-600 flex-1 truncate">"{report.publication.text}"</p>
                            <Link href={`/publication/${report.publication.id}`} className="text-xs text-[#FF4655] hover:underline flex-shrink-0">Veure →</Link>
                        </div>
                    )}
                    {report.comment && (
                        <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-start gap-2">
                            <p className="text-sm text-gray-600 flex-1 truncate">"{report.comment.text}"</p>
                            {report.comment.publicationId && (
                                <Link href={`/publication/${report.comment.publicationId}`} className="text-xs text-[#FF4655] hover:underline flex-shrink-0">Veure →</Link>
                            )}
                        </div>
                    )}

                    {/* Resposta de l'admin */}
                    {report.adminComment && (
                        <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2">Admin: "{report.adminComment}"</p>
                    )}

                    {/* Botons d'acció */}
                    <div className="flex gap-2 pt-1">
                        {/* Usuari: editar i eliminar només si està pendent */}
                        {!isAdmin && report.status === "pending" && (
                            <>
                                <button onClick={() => { setEditId(report.id); setEditReasons(report.reasons) }} className="btn btn-secondary text-sm flex-1">✏️ Editar</button>
                                <button onClick={() => setDeleteId(report.id)} className="btn btn-danger text-sm flex-1">🗑️ Eliminar</button>
                            </>
                        )}
                        {!isAdmin && report.status !== "pending" && (
                            <button onClick={() => setDeleteId(report.id)} className="btn btn-ghost text-sm">🗑️ Eliminar</button>
                        )}
                        {/* Admin: respondre si està pendent */}
                        {isAdmin && report.status === "pending" && (
                            <button onClick={() => { setActiveReport(report); setAdminComment(report.adminComment ?? ""); setDeleteContent(false); setNotifyCreator(false); setNotifyText("") }}
                                className="btn btn-primary text-sm flex-1">Respondre</button>
                        )}
                    </div>
                </div>
            ))}

            {/* Modal confirmació eliminar */}
            {deleteId && (
                <ConfirmModal
                    message="Vols eliminar aquest report?"
                    onConfirm={() => handleDelete(deleteId)}
                    onCancel={() => setDeleteId(null)}
                />
            )}

            {/* Modal resposta admin */}
            {activeReport && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 flex flex-col gap-4 shadow-xl">
                        <h2 className="font-semibold">Respondre report #{activeReport.id}</h2>
                        <textarea value={adminComment} onChange={e => setAdminComment(e.target.value)} placeholder="Comentari intern (opcional)" rows={3} className="input resize-none" />
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={deleteContent} onChange={e => setDeleteContent(e.target.checked)} className="w-4 h-4 accent-[#FF4655]" />
                                Eliminar el contingut reportat
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" checked={notifyCreator} onChange={e => setNotifyCreator(e.target.checked)} className="w-4 h-4 accent-[#FF4655]" />
                                Notificar al creador
                            </label>
                        </div>
                        {notifyCreator && (
                            <textarea value={notifyText} onChange={e => setNotifyText(e.target.value)} placeholder="Missatge per al creador..." rows={2} className="input resize-none" />
                        )}
                        <div className="flex gap-3">
                            <button onClick={() => setActiveReport(null)} className="btn btn-ghost flex-1">Cancel·lar</button>
                            <button onClick={() => handleAdminRespond("rejected")} className="btn btn-secondary flex-1">❌ Rebutjar</button>
                            <button onClick={() => handleAdminRespond("accepted")} className="btn btn-primary flex-1">✅ Acceptar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
