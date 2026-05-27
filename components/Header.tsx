'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ConfirmModal from './ui/ConfirmModal'

export default function Header() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [showLogout, setShowLogout] = useState(false)
    const [showContactAdmin, setShowContactAdmin] = useState(false)
    const [search, setSearch] = useState('')
    const [notiCount, setNotiCount] = useState(0)
    const [requestCount, setRequestCount] = useState(0)
    const [reportCount, setReportCount] = useState(0)
    const [messageCount, setMessageCount] = useState(0)

    useEffect(() => {
        if (!session) return
        fetch('/api/notifications/count').then(res => res.json()).then(data => setNotiCount(data.count ?? 0))
        fetch('/api/friendship/requests/count').then(res => res.json()).then(data => setRequestCount(data.count ?? 0))
        fetch('/api/reports/count').then(res => res.json()).then(data => setReportCount(data.count ?? 0))
        fetch('/api/messages/count').then(res => res.json()).then(data => setMessageCount(data.count ?? 0))
    }, [session])

    async function contactAdmin() {
        const res = await fetch('/api/admin/contact', { method: 'POST' })
        const data = await res.json()
        if (data.conversationId) window.location.href = `/chat/${data.conversationId}`
    }

    if (['/login', '/register'].includes(pathname)) return null

    const navLink = (href: string, label: string) => (
        <Link
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === href ? 'bg-[#FF4655] text-white' : 'text-gray-600 hover:bg-[#fff0f1] hover:text-[#FF4655]'}`}
        >
            {label}
        </Link>
    )

    return (
        <>
            <header className="h-14 border-b border-gray-100 bg-white flex items-center px-6 gap-4 sticky top-0 z-40 shadow-sm">

                {/* Logo + nom */}
                <Link href="/home" className="flex items-center gap-2 mr-2 flex-shrink-0">
                    <img id="logo" src="/img/logo.png" alt="Social Valorant" className="h-8 w-8 object-contain" />
                    <span className="font-bold text-[#FF4655] text-base tracking-tight hidden sm:block">SOCIAL VALORANT</span>
                </Link>

                {/* Cercador */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Cerca..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
                    />
                </div>

                {/* Navegació central */}
                <nav className="flex items-center gap-1 flex-1 justify-center">
                    {navLink('/home', 'Inici')}
                    <Link
                        href="/notifications"
                        onClick={() => setNotiCount(0)}
                        className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/notifications' ? 'bg-[#FF4655] text-white' : 'text-gray-600 hover:bg-[#fff0f1] hover:text-[#FF4655]'}`}
                    >
                        Notificacions
                        {notiCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#FF4655] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                {notiCount > 9 ? '9+' : notiCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/requests"
                        onClick={() => setRequestCount(0)}
                        className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/requests' ? 'bg-[#FF4655] text-white' : 'text-gray-600 hover:bg-[#fff0f1] hover:text-[#FF4655]'}`}
                    >
                        Sol·licituds
                        {requestCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#FF4655] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                {requestCount > 9 ? '9+' : requestCount}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/messages"
                        onClick={() => setMessageCount(0)}
                        className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/messages' ? 'bg-[#FF4655] text-white' : 'text-gray-600 hover:bg-[#fff0f1] hover:text-[#FF4655]'}`}
                    >
                        Missatges
                        {messageCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#FF4655] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                {messageCount > 9 ? '9+' : messageCount}
                            </span>
                        )}
                    </Link>
                    {(session?.user as { isAdmin?: boolean })?.isAdmin && (
                        <Link
                            href="/reports"
                            onClick={() => setReportCount(0)}
                            className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/reports' ? 'bg-[#FF4655] text-white' : 'text-gray-600 hover:bg-[#fff0f1] hover:text-[#FF4655]'}`}
                        >
                            Reports
                            {reportCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#FF4655] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                    {reportCount > 9 ? '9+' : reportCount}
                                </span>
                            )}
                        </Link>
                    )}
                </nav>

                {/* Accions dreta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <Link href="/publicate" className="btn btn-primary text-sm px-4 py-1.5">
                        + Publicar
                    </Link>
                    <Link href={`/user/${session?.user?.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <img src="/img/profile.png" alt="perfil" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                        <span className="text-sm font-medium hidden md:block">{session?.user?.name}</span>
                    </Link>
                    <Link href="/settings" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </Link>
                    <button onClick={() => setShowContactAdmin(true)} title="Contactar amb l'admin" className="text-gray-400 hover:text-[#FF4655] transition-colors text-lg">
                        ❓
                    </button>
                    <button onClick={() => setShowLogout(true)} className="text-gray-400 hover:text-[#FF4655] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </header>

            {showLogout && (
                <ConfirmModal
                    message="Vols tancar la sessió?"
                    onConfirm={() => signOut({ callbackUrl: '/login' })}
                    onCancel={() => setShowLogout(false)}
                />
            )}
            {showContactAdmin && (
                <ConfirmModal
                    message="Vols contactar amb l'administrador?"
                    onConfirm={() => { setShowContactAdmin(false); contactAdmin() }}
                    onCancel={() => setShowContactAdmin(false)}
                />
            )}
        </>
    )
}
