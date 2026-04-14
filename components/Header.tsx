'use client'
import Link from 'next/link'

export default function Header(){
    return <header className="flex items-center gap-4 h-16 bg-blue-100 px-4 justify-between">
          <Link href="/home" className="border px-3 py-1 rounded-lg">HOME</Link>
          
          <div className="flex items-center gap-2">
            <img src="/img/search.png" alt="cercar" className="w-5 h-5"/>
            <input type="text" className="border rounded px-2 py-1"/>
          </div>
          
          <Link href="/following">Following</Link>
          <Link href="/publicate">Publicate</Link>
          <Link href="/reports">Reports</Link>

          <nav className="flex">
            <Link href="/notifications" className="border px-3 py-1 rounded-l-lg">Notifications</Link>
            <Link href="/requests" className="border-y border-r px-3 py-1">Requests</Link>
            <Link href="/messages" className="border-y border-r px-3 py-1 rounded-r-lg">Direct messages</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/settings">
              <img src="/img/settings.png" alt="settings" className="cursor-pointer w-8 h-8" />
            </Link>
            <Link href="/user">
              <img src="/img/porfile.png" alt="profile" className="cursor-pointer w-8 h-8" />
            </Link>
            <Link href="/login">
              <img src="/img/logout.png" alt="logOut" className="cursor-pointer w-8 h-8" />
            </Link>
          </div>
        </header>
}