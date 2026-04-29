'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault()
        setError('')
        const res = await signIn('credentials', { email, password, redirect: false })
        if (res?.error) {
            setError('Email o contrasenya incorrectes')
        } else {
            window.location.href = '/home'
        }
    }

    return (
        <div>
            <h1>INICIAR SESSIÓ</h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Contrasenya" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
                <button type="submit">Iniciar sessió</button>
            </form>
            <a href="/register">No tens compte? Registra't-hi</a>
        </div>
    )
}
