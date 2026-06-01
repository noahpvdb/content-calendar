'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { Plus, Search, Grid, List, Trash2, Pencil, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { PLATFORMS, PILLARS, STATUS_COLORS, PRIORITY_COLORS, getPlatformLabel, cn } from '@/lib/utils'

type Idea = {
  id: string
  title: string
  description: string | null
  platform: string
  pillar: string | null
  tags: string
  priority: string
  status: string
  createdAt: string
}

function IdeaForm({ idea, onSave, onCancel }: {
  idea?: Idea | null
  onSave: (data: Partial<Idea>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: idea?.title ?? '',
    description: idea?.description ?? '',
    platform: idea?.platform ?? 'instagram',
    pillar: idea?.pillar ?? '',
    priority: idea?.priority ?? 'medium',
    status: idea?.status ?? 'idea',
    caption: '',
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
          <h2 className="text-lg font-semibold">{idea ? 'Edit Idea' : 'New Content Idea'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="e.g. Behind the scenes at the shop"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
              placeholder="What's this post about?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pillar</label>
              <select
                value={form.pillar}
                onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">None</option>
                {PILLARS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="idea">Idea</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : idea ? 'Save Changes' : 'Add Idea'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IdeasContent() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('all')
  const [status, setStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [showForm, setShowForm] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true)
  }, [searchParams])

  const fetchIdeas = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (platform !== 'all') params.set('platform', platform)
    if (status !== 'all') params.set('status', status)
    const res = await fetch(`/api/ideas?${params}`)
    setIdeas(await res.json())
    setLoading(false)
  }, [search, platform, status])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  async function handleSave(data: Partial<Idea>) {
    if (editingIdea) {
      await fetch(`/api/ideas/${editingIdea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setShowForm(false)
    setEditingIdea(null)
    fetchIdeas()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this idea?')) return
    await fetch(`/api/ideas/${id}`, { method: 'DELETE' })
    fetchIdeas()
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Content Ideas</h2>
            <p className="text-gray-500 text-sm mt-0.5">{ideas.length} ideas</p>
          </div>
          <button
            onClick={() => { setEditingIdea(null); setShowForm(true) }}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={15} /> Add Idea
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ideas..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="all">All Status</option>
            <option value="idea">Idea</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={cn('px-3 py-2', viewMode === 'table' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50')}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={cn('px-3 py-2', viewMode === 'card' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50')}
            >
              <Grid size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Platform</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Pillar</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Added</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {ideas.map(idea => (
                  <tr key={idea.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/ideas/${idea.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {idea.title}
                      </Link>
                      {idea.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{idea.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{getPlatformLabel(idea.platform)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{idea.pillar || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[idea.priority]}`}>
                        {idea.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>
                        {idea.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{format(new Date(idea.createdAt), 'MMM d')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingIdea(idea); setShowForm(true) }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(idea.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {ideas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No ideas found. Add your first one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {ideas.map(idea => (
              <div key={idea.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>
                    {idea.status}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingIdea(idea); setShowForm(true) }} className="p-1 text-gray-300 hover:text-gray-600 transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => handleDelete(idea.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
                <Link href={`/ideas/${idea.id}`}>
                  <h3 className="font-medium text-gray-900 text-sm mb-1 hover:underline leading-snug">{idea.title}</h3>
                </Link>
                {idea.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{idea.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{getPlatformLabel(idea.platform)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[idea.priority]}`}>{idea.priority}</span>
                </div>
              </div>
            ))}
            {ideas.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400">No ideas found.</div>
            )}
          </div>
        )}
      </div>

      {(showForm || editingIdea) && (
        <IdeaForm
          idea={editingIdea}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingIdea(null) }}
        />
      )}
    </div>
  )
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <IdeasContent />
    </Suspense>
  )
}
