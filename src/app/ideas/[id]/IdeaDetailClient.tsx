'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { STATUS_COLORS, PRIORITY_COLORS, PLATFORMS, PILLARS, getPlatformLabel } from '@/lib/utils'

type ScheduledPost = {
  id: string
  scheduledDate: string
  scheduledTime: string
  status: string
  platform: string
}

type Idea = {
  id: string
  title: string
  description: string | null
  platform: string
  pillar: string | null
  tags: string
  priority: string
  status: string
  notes: string | null
  caption: string | null
  createdAt: string
  scheduledPosts: ScheduledPost[]
}

export function IdeaDetailClient({ idea: initialIdea }: { idea: Idea }) {
  const [idea, setIdea] = useState(initialIdea)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: idea.title,
    description: idea.description ?? '',
    platform: idea.platform,
    pillar: idea.pillar ?? '',
    priority: idea.priority,
    status: idea.status,
    notes: idea.notes ?? '',
    caption: idea.caption ?? '',
  })
  const router = useRouter()

  async function handleSave() {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const updated = await res.json()
    setIdea(prev => ({ ...prev, ...updated }))
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this idea and all its scheduled posts?')) return
    await fetch(`/api/ideas/${idea.id}`, { method: 'DELETE' })
    router.push('/ideas')
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editing ? (
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="text-2xl font-semibold w-full border-b border-gray-300 pb-1 focus:outline-none focus:border-gray-900"
            />
          ) : (
            <h1 className="text-2xl font-semibold text-gray-900">{idea.title}</h1>
          )}
          <p className="text-gray-400 text-sm mt-1">Added {format(new Date(idea.createdAt), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2 ml-4">
          {editing ? (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium">
                <Check size={14} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">
                <X size={14} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={handleDelete} className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Platform',
            value: editing ? (
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            ) : getPlatformLabel(idea.platform)
          },
          {
            label: 'Status',
            value: editing ? (
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                {['idea','draft','scheduled','posted'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>{idea.status}</span>
          },
          {
            label: 'Priority',
            value: editing ? (
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                {['low','medium','high'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[idea.priority]}`}>{idea.priority}</span>
          },
          {
            label: 'Pillar',
            value: editing ? (
              <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                <option value="">None</option>
                {PILLARS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            ) : (idea.pillar ?? '—')
          },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <div className="text-sm font-medium text-gray-900 capitalize">{value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[
          { label: 'Description', field: 'description' as const },
          { label: 'Caption Draft', field: 'caption' as const },
          { label: 'Notes', field: 'notes' as const },
        ].map(({ label, field }) => (
          <div key={field} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
            {editing ? (
              <textarea
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                rows={3}
                className="w-full text-sm text-gray-700 border-0 focus:outline-none resize-none"
                placeholder={`Add ${label.toLowerCase()}...`}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {(idea[field] as string) || <span className="text-gray-300">None</span>}
              </p>
            )}
          </div>
        ))}

        {idea.scheduledPosts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Scheduled Posts</p>
            <div className="space-y-2">
              {idea.scheduledPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{format(new Date(post.scheduledDate), 'MMMM d, yyyy')} at {post.scheduledTime}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[post.status]}`}>{post.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
