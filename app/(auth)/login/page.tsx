'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        const res = await signIn('credentials', { email, password, redirect: false })
        if (res?.error) setError('Email o contrasenya incorrectes')
        else window.location.href = '/home'
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-sm flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2">
                    <img id="logo" src="/img/logo.png" alt="Social Valorant" className="h-12 w-12 object-contain" />
                    <h1 className="text-xl font-bold text-[#FF4655]">SOCIAL VALORANT</h1>
                    <p className="text-sm text-gray-400">Inicia sessió per continuar</p>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="border rounded px-3 py-2 text-sm"
                    />
                    <input
                        type="password"
                        placeholder="Contrasenya"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="border rounded px-3 py-2 text-sm"
                    />
                    <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 text-sm hover:bg-blue-600">
                        Iniciar sessió
                    </button>
                </form>
                <p className="text-sm text-center text-gray-500">
                    No tens compte?{" "}
                    <Link href="/register" className="text-blue-500 hover:underline">Registra't</Link>
                </p>
            </div>
        </div>
    )
}
