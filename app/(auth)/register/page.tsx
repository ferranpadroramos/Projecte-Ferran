'use client'
import { useState } from 'react'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit() {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })

        if (!res.ok) {
            const data = await res.json()
            setError(data.error)
            return
        }

        setSuccess(true)
    }

    return (
        <div>
            <h1>REGISTRE</h1>
            {error && <p>{error}</p>}
            {success && <p>Registre completat amb èxit!</p>}
            <form>
                <input type="text" placeholder="Usuari" value={username} onChange={(e) => setUsername(e.target.value)} required /><br />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Contrasenya" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
                <button onClick={handleSubmit}>Registrar-se</button>
                <a href="/login">Ja tens un compte? Inicia sessió</a>
            </form>
        </div>
    )
}
