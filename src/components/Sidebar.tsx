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
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-3 shrink-0">
      <div className="px-3 mb-8">
        <h1 className="text-lg font-semibold text-gray-900">Content Calendar</h1>
        <p className="text-xs text-gray-400 mt-0.5">Social Media Planner</p>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3">
        <p className="text-xs text-gray-400">© 2026 Content Calendar</p>
      </div>
    </aside>
  )
}
