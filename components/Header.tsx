'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import ConfirmModal from './ui/ConfirmModal'

export default function Header(){
    const pathname = usePathname()
    const { data: session } = useSession()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

    if (['/login', '/register'].includes(pathname)) return null
    return <header className="flex items-center gap-4 h-16 bg-blue-100 px-4 justify-between">
          <Link href="/home" className="border px-3 py-1 rounded-lg">HOME</Link>
          
          <div className="flex items-center gap-2">
            <img src="/img/search.png" alt="cercar" className="w-5 h-5"/>
            <input type="text" className="border rounded px-2 py-1"/>
          </div>
          
          <Link href="/publicate">Publicar</Link>
          <Link href="/reports">Reportes</Link>

          <nav className="flex">
            <Link href="/notifications" className="border px-3 py-1 rounded-l-lg">Notificacions</Link>
            <Link href="/requests" className="border-y border-r px-3 py-1">Sol·licituds</Link>
            <Link href="/messages" className="border-y border-r px-3 py-1 rounded-r-lg">Xat directe</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/settings">
              <img src="/img/settings.png" alt="settings" className="cursor-pointer w-8 h-8" />
            </Link>
            <Link href={`/user/${session?.user?.id}`} className="flex items-center gap-2">
              <img src="/img/profile.png" alt="profile" className="cursor-pointer w-8 h-8" />
              <span>{session?.user?.name}</span>
            </Link>
            {/* Botó de logout amb confirmació */}
            <button onClick={() => setShowLogoutConfirm(true)}>
              <img src="/img/logout.png" alt="logOut" className="cursor-pointer w-8 h-8" />
            </button>
          </div>

          {/* Modal de confirmació de logout */}
          {showLogoutConfirm && (
            <ConfirmModal
              message="Vols tancar la sessió?"
              onConfirm={() => signOut({ callbackUrl: '/login' })}
              onCancel={() => setShowLogoutConfirm(false)}
            />
          )}
        </header>
}