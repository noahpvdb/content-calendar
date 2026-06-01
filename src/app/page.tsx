import { Lightbulb, Calendar, Clock, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'
import { STATUS_COLORS, getPlatformLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getStats() {
  const now = new Date()
  const [totalIdeas, weekPosts, monthPosts, recentIdeas] = await Promise.all([
    prisma.contentIdea.count(),
    prisma.scheduledPost.count({
      where: { scheduledDate: { gte: startOfWeek(now), lte: endOfWeek(now) } },
    }),
    prisma.scheduledPost.count({
      where: { scheduledDate: { gte: startOfMonth(now), lte: endOfMonth(now) } },
    }),
    prisma.contentIdea.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])
  return { totalIdeas, weekPosts, monthPosts, recentIdeas }
}

export default async function Dashboard() {
  const { totalIdeas, weekPosts, monthPosts, recentIdeas } = await getStats()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold" style={{ color: '#2C3D2E' }}>Dashboard</h2>
        <p className="mt-1" style={{ color: '#6B7280' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Ideas', value: totalIdeas, icon: Lightbulb },
          { label: 'Posts This Week', value: weekPosts, icon: Clock },
          { label: 'Posts This Month', value: monthPosts, icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC' }}>
            <div className="inline-flex p-2.5 rounded-lg mb-3" style={{ backgroundColor: '#F0EAD6' }}>
              <Icon size={18} style={{ color: '#C9A84C' }} />
            </div>
            <div className="text-3xl font-bold" style={{ color: '#2C3D2E' }}>{value}</div>
            <div className="text-sm mt-1" style={{ color: '#6B7280' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: '#8B7355' }}>Quick Actions</h3>
        <div className="flex gap-3">
          <Link
            href="/ideas?new=1"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#2C3D2E', color: '#C9A84C' }}
          >
            <Plus size={15} /> Add Idea
          </Link>
          <Link
            href="/scheduled?new=1"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC', color: '#2C3D2E' }}
          >
            <Clock size={15} /> Schedule Post
          </Link>
          <Link
            href="/calendar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC', color: '#2C3D2E' }}
          >
            <Calendar size={15} /> View Calendar
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Recently Added</h3>
          <Link href="/ideas" className="text-sm flex items-center gap-1 hover:underline" style={{ color: '#C9A84C' }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC' }}>
          {recentIdeas.length === 0 ? (
            <div className="p-8 text-center" style={{ color: '#9CA3AF' }}>No ideas yet. Add your first one!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EAD6' }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Platform</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Added</th>
                </tr>
              </thead>
              <tbody>
                {recentIdeas.map((idea) => (
                  <tr key={idea.id} className="last:border-0 transition-colors" style={{ borderBottom: '1px solid #FAF7F0' }}>
                    <td className="px-4 py-3">
                      <Link href={`/ideas/${idea.id}`} className="text-sm font-medium hover:underline" style={{ color: '#2C3D2E' }}>
                        {idea.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{getPlatformLabel(idea.platform)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#9CA3AF' }}>{format(new Date(idea.createdAt), 'MMM d')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
