'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Plus, Trash2, Pencil, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { STATUS_COLORS, getPlatformLabel, PLATFORMS } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

type Post = {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: string
  platform: string
  caption: string | null
  idea: { id: string; title: string; platform: string }
}

type Idea = { id: string; title: string; platform: string }

function ScheduleForm({ post, ideas, onSave, onCancel }: {
  post?: Post | null
  ideas: Idea[]
  onSave: (data: object) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    ideaId: post?.idea.id ?? (ideas[0]?.id ?? ''),
    scheduledDate: post?.scheduledDate ? format(new Date(post.scheduledDate), 'yyyy-MM-dd') : '',
    scheduledTime: post?.scheduledTime ?? '09:00',
    status: post?.status ?? 'scheduled',
    caption: post?.caption ?? '',
    platform: post?.platform ?? (ideas[0]?.platform ?? 'instagram'),
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">{post ? 'Edit Scheduled Post' : 'Schedule a Post'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Idea *</label>
            <select
              required
              value={form.ideaId}
              onChange={e => {
                const idea = ideas.find(i => i.id === e.target.value)
                setForm(f => ({ ...f, ideaId: e.target.value, platform: idea?.platform ?? f.platform }))
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {ideas.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                required
                type="date"
                value={form.scheduledDate}
                onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="posted">Posted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              placeholder="Post caption..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : post ? 'Save Changes' : 'Schedule Post'}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ScheduledContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [platformFilter, setPlatformFilter] = useState('all')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true)
  }, [searchParams])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const [postsRes, ideasRes] = await Promise.all([
      fetch('/api/scheduled'),
      fetch('/api/ideas'),
    ])
    setPosts(await postsRes.json())
    setIdeas(await ideasRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function handleSave(data: object) {
    if (editingPost) {
      await fetch(`/api/scheduled/${editingPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setShowForm(false)
    setEditingPost(null)
    fetchPosts()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this scheduled post?')) return
    await fetch(`/api/scheduled/${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  const filteredPosts = platformFilter === 'all' ? posts : posts.filter(p => p.platform === platformFilter)

  const grouped = filteredPosts.reduce((acc: Record<string, Post[]>, post) => {
    const key = format(new Date(post.scheduledDate), 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = []
    acc[key].push(post)
    return acc
  }, {})

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Scheduled Posts</h2>
          <p className="text-gray-500 text-sm mt-0.5">{filteredPosts.length} posts</p>
        </div>
        <button
          onClick={() => { setEditingPost(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={15} /> Schedule Post
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="all">All Platforms</option>
          {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No scheduled posts yet.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([date, dayPosts]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-sm font-semibold text-gray-700">
                  {format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d')}
                </div>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-2">
                {dayPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-400 w-16 shrink-0">
                      <Clock size={13} />
                      <span className="text-xs font-mono">{post.scheduledTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{post.idea.title}</p>
                      {post.caption && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">{post.caption}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">{getPlatformLabel(post.platform)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[post.status]}`}>
                        {post.status}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingPost(post); setShowForm(true) }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingPost) && (
        <ScheduleForm
          post={editingPost}
          ideas={ideas}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPost(null) }}
        />
      )}
    </div>
  )
}

export default function ScheduledPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <ScheduledContent />
    </Suspense>
  )
}
