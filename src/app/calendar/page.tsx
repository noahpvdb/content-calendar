'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPlatformLabel, STATUS_COLORS, getPlatformColor } from '@/lib/utils'

type Post = {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: string
  platform: string
  idea: { title: string; platform: string }
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Calendar</h2>
          <p className="text-gray-500 text-sm mt-0.5">{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayPosts = getPostsForDay(day)
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            return (
              <div
                key={i}
                className={`min-h-[120px] border-b border-r border-gray-50 p-2 ${!inMonth ? 'bg-gray-50/50' : ''} ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full
                  ${today ? 'bg-gray-900 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayPosts.map(post => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="w-full text-left"
                    >
                      <div className="text-xs px-1.5 py-1 rounded-md truncate font-medium transition-opacity hover:opacity-80"
                        style={{ backgroundColor: getPlatformColor(post.platform) + '20', color: getPlatformColor(post.platform) }}>
                        {post.idea.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{selectedPost.idea.title}</h3>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-700">&#x2715;</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Platform</span>
                <span className="font-medium">{getPlatformLabel(selectedPost.platform)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{format(new Date(selectedPost.scheduledDate), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{selectedPost.scheduledTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
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
