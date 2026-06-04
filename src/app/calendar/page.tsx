'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getPlatformLabel, STATUS_COLORS, getPlatformColor } from '@/lib/utils'

type Post = {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: string
  platform: string
  idea: { id: string; title: string; platform: string; approvalStatus: string }
}

const APPROVAL_ICONS = {
  approved: { icon: CheckCircle, color: '#065F46' },
  rejected: { icon: XCircle,     color: '#991B1B' },
  pending:  { icon: Clock,       color: '#B45309' },
}

const APPROVAL_STYLES = {
  approved: { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
  rejected: { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' },
  pending:  { bg: '#FEF3C7', border: '#FCD34D', text: '#B45309' },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  useEffect(() => {
    const month = format(currentDate, 'yyyy-MM')
    fetch(`/api/scheduled?month=${month}`)
      .then(r => r.json())
      .then(setPosts)
  }, [currentDate])

  function getPostsForDay(day: Date) {
    return posts.filter(p => isSameDay(new Date(p.scheduledDate), day))
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#2C3D2E' }}>Calendar</h2>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            {Object.entries(APPROVAL_STYLES).map(([key, style]) => (
              <span key={key} className="flex items-center gap-1 font-medium capitalize"
                style={{ color: style.text }}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: style.border }} />
                {key}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ border: '1px solid #E8E0CC', backgroundColor: '#fff' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ border: '1px solid #E8E0CC', backgroundColor: '#fff', color: '#2C3D2E' }}>
              Today
            </button>
            <button onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
              className="p-2 rounded-lg hover:opacity-80 transition-opacity"
              style={{ border: '1px solid #E8E0CC', backgroundColor: '#fff' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl shadow-sm overflow-x-auto" style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC' }}>
        <div style={{ minWidth: '560px' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #F0EAD6', backgroundColor: '#FAF7F0' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayPosts = getPostsForDay(day)
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            return (
              <div key={i} className={`min-h-[130px] p-2 ${i % 7 !== 6 ? 'border-r' : ''}`}
                style={{
                  borderBottom: '1px solid #F5F0E8',
                  borderRightColor: '#F5F0E8',
                  backgroundColor: !inMonth ? '#FAF7F2' : '#fff',
                }}>
                <div className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full`}
                  style={today
                    ? { backgroundColor: '#2C3D2E', color: '#C9A84C' }
                    : { color: inMonth ? '#2C3D2E' : '#D1D5DB' }}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayPosts.map(post => {
                    const approval = post.idea.approvalStatus as keyof typeof APPROVAL_STYLES
                    const style = APPROVAL_STYLES[approval] ?? APPROVAL_STYLES.pending
                    const { icon: ApprovalIcon, color: iconColor } = APPROVAL_ICONS[approval] ?? APPROVAL_ICONS.pending
                    return (
                      <button key={post.id} onClick={() => setSelectedPost(post)} className="w-full text-left">
                        <div className="text-xs px-1.5 py-1 rounded-md truncate font-medium flex items-center gap-1 transition-opacity hover:opacity-80"
                          style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                          <ApprovalIcon size={10} style={{ color: iconColor, flexShrink: 0 }} />
                          <span className="truncate">{post.idea.title}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        </div> {/* end minWidth wrapper */}
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            {/* Approval status bar */}
            {(() => {
              const approval = selectedPost.idea.approvalStatus as keyof typeof APPROVAL_STYLES
              const style = APPROVAL_STYLES[approval] ?? APPROVAL_STYLES.pending
              const { icon: ApprovalIcon } = APPROVAL_ICONS[approval] ?? APPROVAL_ICONS.pending
              return (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-sm font-semibold capitalize"
                  style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                  <ApprovalIcon size={14} />
                  {approval}
                </div>
              )
            })()}
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold" style={{ color: '#2C3D2E' }}>{selectedPost.idea.title}</h3>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Platform', value: getPlatformLabel(selectedPost.platform) },
                { label: 'Date', value: format(new Date(selectedPost.scheduledDate), 'MMM d, yyyy') },
                { label: 'Time', value: selectedPost.scheduledTime },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: '#6B7280' }}>{label}</span>
                  <span className="font-medium" style={{ color: '#2C3D2E' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span style={{ color: '#6B7280' }}>Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedPost.status]}`}>
                  {selectedPost.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
