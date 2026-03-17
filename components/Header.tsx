'use client'
export default function Header(){
    return <header className="flex items-center gap-4 h-16 bg-blue-100 px-4 justify-between">
          {/* <a href> - Navegació tradicional amb recàrrega de pàgina */}
          <a href="/" className="border px-3 py-1 rounded-lg">HOME</a>
          
          
          <div className="flex items-center gap-2">
            <img src="/img/search.png" alt="cercar" className="w-5 h-5"/>
            <input type="text" className="border rounded px-2 py-1"/>
          </div>
          
          {/* <a href> - Navegació tradicional amb recàrrega de pàgina */}
          <a href="/following">Following</a>
          <a href="/team">Team</a>
          <a href="/publicate">Publicate</a>

          <nav className="flex">
            {/* <a href> - Navegació amb recàrrega */}
            <a href="/notification" className="border px-3 py-1 rounded-l-lg">Notifications</a>
            <a href="" className="border-y border-r px-3 py-1">Requests</a>
            <a href="" className="border-y border-r px-3 py-1 rounded-r-lg">Direct messages</a>
          </nav>

          <div className="flex items-center gap-4 ml-auto">
            {/* <a> envoltant imatge - Fa redirect quan es clica */}
            <a href="/user">
              <img src="/img/user.png" alt="porfile" className="cursor-pointer" />
            </a>
            <a href="/login">
              <img src="/img/logout.png" alt="logOut" className="cursor-pointer" />
            </a>
          </div>
        </header>

}