'use client'

type Props = {
    message: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
    return (
        // Fons fosc semitransparent
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4 shadow-lg">
                <p className="text-sm text-center">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 border rounded px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Cancel·lar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 bg-red-500 text-white rounded px-4 py-2 text-sm hover:bg-red-600"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    )
}
