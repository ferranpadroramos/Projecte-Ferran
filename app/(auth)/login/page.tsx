'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'


export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleSubmit(){
        await signIn('credentials', { email, password, callbackUrl: '/' })
    }

    return (
        <div>
            <h1>LOG IN</h1>
            <form>
                <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
                <input type="password" name="password" placeholder="Contrasenya" value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
                <button onClick={handleSubmit}>Log In</button>
            </form>
        </div>
    )
}
