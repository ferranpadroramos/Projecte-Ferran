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
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-5">
                <div className="flex flex-col items-center gap-2">
                    <img src="/img/logo.png" alt="Social Valorant" className="h-14 w-14 object-contain" />
                    <h1 className="text-xl font-bold text-[#FF4655] tracking-tight">SOCIAL VALORANT</h1>
                    <p className="text-sm text-gray-400">Inicia sessió per continuar</p>
                </div>
                {error && <p className="text-[#FF4655] text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
                    <input type="password" placeholder="Contrasenya" value={password} onChange={e => setPassword(e.target.value)} required className="input" />
                    <button type="submit" className="btn btn-primary w-full mt-1">Iniciar sessió</button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    No tens compte?{" "}
                    <Link href="/register" className="text-[#FF4655] font-medium hover:underline">Registra't</Link>
                </p>
            </div>
        </div>
    )
}
