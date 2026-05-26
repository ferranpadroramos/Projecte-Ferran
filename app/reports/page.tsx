'use client'
import { useEffect, useState } from "react"
import Link from "next/link"

type Report = {
    id: number
    reasons: string[]
    status: string
    adminComment: string | null
    createdAt: string
    resolvedAt: string | null
    author: { id: number, username: string }
    publication: { id: number, text: string, imageUrl: string | null, author: { id: number, username: string } } | null
    comment: { id: number, text: string, author: { id: number, username: string }, publicationId: number | null } | null
}

const STATUS_LABELS: Record<string, string> = {
    pending: "⏳ Pendent",
    accepted: "✅ Acceptat",
    rejected: "❌ Rebutjat"
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700"
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [activeReport, setActiveReport] = useState<Report | null>(null)
    // Estat del formulari de resposta
    const [adminComment, setAdminComment] = useState("")
    const [deleteContent, setDeleteContent] = useState(false)
    const [notifyCreator, setNotifyCreator] = useState(false)
    const [notifyText, setNotifyText] = useState("")
    const [filter, setFilter] = useState("pending")

    useEffect(() => {
        fetch("/api/reports")
            .then(res => res.json())
            .then(data => { setReports(data); setLoading(false) })
    }, [])

    function openReport(report: Report) {
        setActiveReport(report)
        setAdminComment(report.adminComment ?? "")
        setDeleteContent(false)
        setNotifyCreator(false)
        setNotifyText("")
    }

    async function handleRespond(status: "accepted" | "rejected") {
        if (!activeReport) return
        await fetch(`/api/reports/${activeReport.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, adminComment, deleteContent, notifyCreator, notifyText })
        })
        // Actualitzar l'estat del report a la llista
        setReports(prev => prev.map(r =>
            r.id === activeReport.id ? { ...r, status, adminComment, resolvedAt: new Date().toISOString() } : r
        ))
        setActiveReport(null)
    }

    const filtered = reports.filter(r => r.status === filter)

    if (loading) return <p className="text-center mt-10 text-gray-400">Carregant...</p>

    return (
        <div className="max-w-2xl mx-auto mt-6 px-4 flex flex-col gap-4">
            <h1 className="text-xl font-bold">Gestió de reports</h1>

            {/* Filtre per estat */}
            <div className="flex gap-2">
                {["pending", "accepted", "rejected"].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1 rounded-full text-sm ${filter === s ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                        {STATUS_LABELS[s]}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center mt-6">No hi ha reports {STATUS_LABELS[filter].toLowerCase()}</p>
            )}

            {/* Llista de reports */}
            {filtered.map(report => (
                <div key={report.id} className="border rounded-xl p-4 flex flex-col gap-3 shadow-sm">

                    {/* Capçalera: qui ha reportat + estat + data */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            Reportat per{" "}
                            <Link href={`/user/${report.author.id}`} className="font-semibold hover:underline">
                                @{report.author.username}
                            </Link>
                            <span className="text-gray-400 ml-2 text-xs">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[report.status]}`}>
                            {STATUS_LABELS[report.status]}
                        </span>
                    </div>

                    {/* Motius del report */}
                    <div className="flex flex-wrap gap-1">
                        {report.reasons.map(r => (
                            <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                    </div>

                    {/* Contingut reportat */}
                    {report.publication && (
                        <div className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Publicació de{" "}
                                    <Link href={`/user/${report.publication.author.id}`} className="font-medium hover:underline">
                                        @{report.publication.author.username}
                                    </Link>
                                </span>
                                <Link href={`/publication/${report.publication.id}`} className="text-xs text-blue-500 hover:underline">
                                    Veure →
                                </Link>
                            </div>
                            <p className="text-sm">{report.publication.text}</p>
                            {report.publication.imageUrl && (
                                <img src={report.publication.imageUrl} alt="pub" className="rounded max-h-32 object-cover" />
                            )}
                        </div>
                    )}

                    {report.comment && (
                        <div className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Comentari de{" "}
                                    <Link href={`/user/${report.comment.author.id}`} className="font-medium hover:underline">
                                        @{report.comment.author.username}
                                    </Link>
                                </span>
                                {report.comment.publicationId && (
                                    <Link href={`/publication/${report.comment.publicationId}`} className="text-xs text-blue-500 hover:underline">
                                        Veure publicació →
                                    </Link>
                                )}
                            </div>
                            <p className="text-sm">{report.comment.text}</p>
                        </div>
                    )}

                    {/* Comentari de l'admin si ja s'ha resolt */}
                    {report.adminComment && (
                        <p className="text-xs text-gray-500 italic">Resposta admin: "{report.adminComment}"</p>
                    )}

                    {/* Botó per obrir el formulari de resposta (només si està pendent) */}
                    {report.status === "pending" && (
                        <button
                            onClick={() => openReport(report)}
                            className="self-start bg-blue-500 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-600"
                        >
                            Respondre
                        </button>
                    )}
                </div>
            ))}

            {/* Modal de resposta */}
            {activeReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 flex flex-col gap-4 shadow-lg">
                        <h2 className="font-semibold">Respondre report #{activeReport.id}</h2>

                        {/* Comentari opcional de l'admin */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">Comentari (opcional)</label>
                            <textarea
                                value={adminComment}
                                onChange={e => setAdminComment(e.target.value)}
                                placeholder="Afegeix un comentari intern..."
                                rows={3}
                                className="border rounded p-2 text-sm resize-none"
                            />
                        </div>

                        {/* Opcions addicionals */}
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={deleteContent}
                                    onChange={e => setDeleteContent(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                Eliminar el contingut reportat
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notifyCreator}
                                    onChange={e => setNotifyCreator(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                Notificar al creador del contingut
                            </label>
                        </div>

                        {/* Text de la notificació si s'ha marcat */}
                        {notifyCreator && (
                            <textarea
                                value={notifyText}
                                onChange={e => setNotifyText(e.target.value)}
                                placeholder="Missatge per al creador..."
                                rows={2}
                                className="border rounded p-2 text-sm resize-none"
                            />
                        )}

                        {/* Botons d'acció */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setActiveReport(null)}
                                className="flex-1 border rounded px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                Cancel·lar
                            </button>
                            <button
                                onClick={() => handleRespond("rejected")}
                                className="flex-1 bg-gray-200 text-gray-700 rounded px-4 py-2 text-sm hover:bg-gray-300"
                            >
                                ❌ Rebutjar
                            </button>
                            <button
                                onClick={() => handleRespond("accepted")}
                                className="flex-1 bg-green-500 text-white rounded px-4 py-2 text-sm hover:bg-green-600"
                            >
                                ✅ Acceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
