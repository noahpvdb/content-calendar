'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { Plus, Search, Grid, List, Trash2, Pencil, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { PLATFORMS, PILLARS, STATUS_COLORS, PRIORITY_COLORS, getPlatformLabel, getPlatformsLabel, parsePlatforms, cn } from '@/lib/utils'

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

function PlatformPicker({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) {
  function toggle(p: string) {
    onChange(value.includes(p) ? value.filter(x => x !== p) : [...value, p])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map(p => (
        <button
          key={p.value}
          type="button"
          onClick={() => toggle(p.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          style={value.includes(p.value)
            ? { backgroundColor: p.color, color: '#fff', borderColor: p.color }
            : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

function IdeaForm({ idea, onSave, onCancel }: {
  idea?: Idea | null
  onSave: (data: Partial<Idea> & { platforms: string[] }) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    title: idea?.title ?? '',
    description: idea?.description ?? '',
    platforms: idea ? parsePlatforms(idea.platform) : ['instagram'],
    pillar: idea?.pillar ?? '',
    priority: idea?.priority ?? 'medium',
    status: idea?.status ?? 'idea',
    caption: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.platforms.length === 0) return alert('Please select at least one platform.')
    setLoading(true)
    await onSave({ ...form, platform: JSON.stringify(form.platforms) })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold" style={{ color: '#2C3D2E' }}>{idea ? 'Edit Idea' : 'New Content Idea'}</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platforms *</label>
            <PlatformPicker value={form.platforms} onChange={p => setForm(f => ({ ...f, platforms: p }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              style={{ backgroundColor: '#2C3D2E', color: '#C9A84C' }}
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

function PlatformTags({ platform }: { platform: string }) {
  const platforms = parsePlatforms(platform)
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map(p => {
        const found = PLATFORMS.find(pl => pl.value === p)
        return (
          <span
            key={p}
            className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
            style={{ backgroundColor: found?.color ?? '#6B7280' }}
          >
            {found?.label ?? p}
          </span>
        )
      })}
    </div>
  )
}

function IdeasContent() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
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
    if (status !== 'all') params.set('status', status)
    const res = await fetch(`/api/ideas?${params}`)
    let data: Idea[] = await res.json()
    // Client-side platform filter (handles JSON array platform field)
    if (platformFilter !== 'all') {
      data = data.filter(idea => parsePlatforms(idea.platform).includes(platformFilter))
    }
    setIdeas(data)
    setLoading(false)
  }, [search, platformFilter, status])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  async function handleSave(data: Partial<Idea> & { platforms: string[] }) {
    const payload = { ...data, platform: JSON.stringify(data.platforms) }
    if (editingIdea) {
      await fetch(`/api/ideas/${editingIdea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
            <h2 className="text-2xl font-semibold" style={{ color: '#2C3D2E' }}>Content Ideas</h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{ideas.length} ideas</p>
          </div>
          <button
            onClick={() => { setEditingIdea(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#2C3D2E', color: '#C9A84C' }}
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            />
          </div>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Platforms</option>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="all">All Status</option>
            <option value="idea">Idea</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('table')}
              className={cn('px-3 py-2 transition-colors', viewMode === 'table' ? 'text-white' : 'text-gray-500 hover:bg-gray-50')}
              style={viewMode === 'table' ? { backgroundColor: '#2C3D2E' } : {}}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={cn('px-3 py-2 transition-colors', viewMode === 'card' ? 'text-white' : 'text-gray-500 hover:bg-gray-50')}
              style={viewMode === 'card' ? { backgroundColor: '#2C3D2E' } : {}}
            >
              <Grid size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: '#9CA3AF' }}>Loading...</div>
        ) : viewMode === 'table' ? (
          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #F0EAD6', backgroundColor: '#FAF7F0' }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Platforms</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Pillar</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: '#8B7355' }}>Added</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {ideas.map(idea => (
                  <tr key={idea.id} className="last:border-0 transition-colors hover:bg-amber-50/30" style={{ borderBottom: '1px solid #FAF7F0' }}>
                    <td className="px-4 py-3">
                      <Link href={`/ideas/${idea.id}`} className="text-sm font-medium hover:underline" style={{ color: '#2C3D2E' }}>
                        {idea.title}
                      </Link>
                      {idea.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#9CA3AF' }}>{idea.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3"><PlatformTags platform={idea.platform} /></td>
                    <td className="px-4 py-3 text-sm capitalize" style={{ color: '#6B7280' }}>{idea.pillar || '—'}</td>
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
                    <td className="px-4 py-3 text-sm" style={{ color: '#9CA3AF' }}>{format(new Date(idea.createdAt), 'MMM d')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingIdea(idea); setShowForm(true) }}
                          className="p-1.5 rounded-md transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(idea.id)}
                          className="p-1.5 rounded-md transition-colors text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="p-1.5 rounded-md transition-colors text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {ideas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center" style={{ color: '#9CA3AF' }}>
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
              <div key={idea.id} className="rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC' }}>
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
                  <h3 className="font-medium text-sm mb-2 hover:underline leading-snug" style={{ color: '#2C3D2E' }}>{idea.title}</h3>
                </Link>
                {idea.description && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: '#6B7280' }}>{idea.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <PlatformTags platform={idea.platform} />
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[idea.priority]}`}>{idea.priority}</span>
                </div>
              </div>
            ))}
            {ideas.length === 0 && (
              <div className="col-span-3 text-center py-12" style={{ color: '#9CA3AF' }}>No ideas found.</div>
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
