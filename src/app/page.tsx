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
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Ideas', value: totalIdeas, icon: Lightbulb, color: 'bg-purple-50 text-purple-600' },
          { label: 'Posts This Week', value: weekPosts, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Posts This Month', value: monthPosts, icon: Calendar, color: 'bg-green-50 text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="flex gap-3">
          <Link
            href="/ideas?new=1"
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={15} /> Add Idea
          </Link>
          <Link
            href="/scheduled?new=1"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Clock size={15} /> Schedule Post
          </Link>
          <Link
            href="/calendar"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Calendar size={15} /> View Calendar
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Recently Added</h3>
          <Link href="/ideas" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {recentIdeas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No ideas yet. Add your first one!</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Platform</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Added</th>
                </tr>
              </thead>
              <tbody>
                {recentIdeas.map((idea) => (
                  <tr key={idea.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/ideas/${idea.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {idea.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{getPlatformLabel(idea.platform)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{format(new Date(idea.createdAt), 'MMM d')}</td>
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
