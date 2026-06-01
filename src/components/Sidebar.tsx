'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Lightbulb, Calendar, Clock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/scheduled', label: 'Scheduled', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex flex-col py-6 px-3 shrink-0" style={{ backgroundColor: '#2C3D2E' }}>
      <div className="px-3 mb-8">
        <h1 className="text-lg font-semibold" style={{ color: '#C9A84C' }}>G.J. Andrews</h1>
        <p className="text-xs mt-0.5" style={{ color: '#8AAE8C' }}>Content Calendar</p>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'text-white'
                : 'hover:text-white'
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
      </nav>
      <div className="px-3">
        <p className="text-xs" style={{ color: '#6B9470' }}>© 2026 G.J. Andrews</p>
      </div>
    </aside>
  )
}
