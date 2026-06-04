'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Lightbulb, Calendar, Clock, CheckSquare, Settings, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/scheduled', label: 'Scheduled', icon: Clock },
  { href: '/review', label: 'Review', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function NavLinks({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNav}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === href ? 'text-white' : 'hover:text-white'
          )}
          style={
            pathname === href
              ? { backgroundColor: '#C9A84C', color: '#2C3D2E' }
              : { color: '#B8D4BA' }
          }
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col py-6 px-3 shrink-0" style={{ backgroundColor: '#2C3D2E' }}>
        <div className="px-3 mb-8">
          <h1 className="text-lg font-semibold" style={{ color: '#C9A84C' }}>G.J. Andrews</h1>
          <p className="text-xs mt-0.5" style={{ color: '#8AAE8C' }}>Content Calendar</p>
        </div>
        <nav className="flex-1 space-y-1">
          <NavLinks />
        </nav>
        <div className="px-3">
          <p className="text-xs" style={{ color: '#6B9470' }}>© 2026 G.J. Andrews</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 shadow-md"
        style={{ backgroundColor: '#2C3D2E' }}>
        <h1 className="text-base font-semibold" style={{ color: '#C9A84C' }}>G.J. Andrews</h1>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg" style={{ color: '#C9A84C' }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-64 flex flex-col py-6 px-3 shadow-xl" style={{ backgroundColor: '#2C3D2E' }}>
            <div className="flex items-center justify-between px-3 mb-8">
              <div>
                <h1 className="text-lg font-semibold" style={{ color: '#C9A84C' }}>G.J. Andrews</h1>
                <p className="text-xs mt-0.5" style={{ color: '#8AAE8C' }}>Content Calendar</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: '#8AAE8C' }}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              <NavLinks onNav={() => setOpen(false)} />
            </nav>
            <div className="px-3">
              <p className="text-xs" style={{ color: '#6B9470' }}>© 2026 G.J. Andrews</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
