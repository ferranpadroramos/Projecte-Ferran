'use client'
import { useState } from "react"

const REPORT_OPTIONS = ["Contingut inapropiat", "Spam", "Assetjament", "Informació falsa", "Altres"]

type Props = {
    publicationId?: number
    commentId?: number
    onClose: () => void
}

export default function ReportModal({ publicationId, commentId, onClose }: Props) {
    const [selected, setSelected] = useState<string[]>([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    function toggleOption(option: string) {
        setSelected(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option])
    }

    async function handleSubmit() {
        if (selected.length === 0) { setError("Selecciona almenys un motiu"); return }
        setError("")
        await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicationId, commentId, reasons: selected })
        })
        setSuccess(true)
        setTimeout(onClose, 1500)
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-xl">
                <h2 className="font-semibold text-center">Reportar contingut</h2>
                {success ? (
                    <p className="text-[#FF4655] text-sm text-center py-2">Report enviat correctament ✓</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">Selecciona els motius:</p>
                        <div className="flex flex-col gap-2">
                            {REPORT_OPTIONS.map(option => (
                                <label key={option} className={`flex items-center gap-3 text-sm cursor-pointer px-3 py-2 rounded-lg border transition-colors ${selected.includes(option) ? 'border-[#FF4655] bg-[#fff0f1] text-[#FF4655]' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="checkbox" checked={selected.includes(option)} onChange={() => toggleOption(option)} className="w-4 h-4 accent-[#FF4655]" />
                                    {option}
                                </label>
                            ))}
                        </div>
                        {error && <p className="text-[#FF4655] text-xs">{error}</p>}
                        <div className="flex gap-3 mt-1">
                            <button onClick={onClose} className="btn btn-ghost flex-1">Cancel·lar</button>
                            <button onClick={handleSubmit} className="btn btn-primary flex-1">Enviar report</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
