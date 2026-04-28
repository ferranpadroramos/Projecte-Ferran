'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Header(){
    const pathname = usePathname()
    const { data: session } = useSession()
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
            <Link href={`/user/${session?.user?.id}`}>
              <img src="/img/profile.png" alt="profile" className="cursor-pointer w-8 h-8" />
            </Link>
            <Link href="/api/auth/signout">
              <img src="/img/logout.png" alt="logOut" className="cursor-pointer w-8 h-8" />
            </Link>
          </div>
        </header>
}