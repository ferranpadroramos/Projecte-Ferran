'use client'

type Props = {
    message: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-5 shadow-xl">
                <p className="text-sm text-center text-gray-700">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="btn btn-ghost flex-1">Cancel·lar</button>
                    <button onClick={onConfirm} className="btn btn-primary flex-1">Confirmar</button>
                </div>
            </div>
        </div>
    )
}
