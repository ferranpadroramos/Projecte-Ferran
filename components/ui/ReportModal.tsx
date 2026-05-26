'use client'
import { useState } from "react"

const REPORT_OPTIONS = [
    "Contingut inapropiat",
    "Spam",
    "Assetjament",
    "Informació falsa",
    "Altres",
]

type Props = {
    // Identificadors opcionals segons si es reporta una publicació o comentari
    publicationId?: number
    commentId?: number
    onClose: () => void
}

export default function ReportModal({ publicationId, commentId, onClose }: Props) {
    const [selected, setSelected] = useState<string[]>([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    function toggleOption(option: string) {
        setSelected(prev =>
            prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
        )
    }

    async function handleSubmit() {
        if (selected.length === 0) {
            setError("Selecciona almenys un motiu")
            return
        }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-lg">
                <h2 className="font-semibold text-center">Reportar contingut</h2>

                {success ? (
                    <p className="text-green-500 text-sm text-center">Report enviat correctament ✓</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">Selecciona els motius del report:</p>

                        {/* Checkboxes de motius */}
                        <div className="flex flex-col gap-2">
                            {REPORT_OPTIONS.map(option => (
                                <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        onChange={() => toggleOption(option)}
                                        className="w-4 h-4"
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>

                        {error && <p className="text-red-500 text-xs">{error}</p>}

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 border rounded px-4 py-2 text-sm hover:bg-gray-50"
                            >
                                Cancel·lar
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 bg-red-500 text-white rounded px-4 py-2 text-sm hover:bg-red-600"
                            >
                                Enviar report
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
