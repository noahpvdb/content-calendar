'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Trash2, Pencil, Check, X, Upload, CheckCircle, XCircle, Clock, ImageIcon, Loader } from 'lucide-react'
import { STATUS_COLORS, PRIORITY_COLORS, PLATFORMS, PILLARS, parsePlatforms } from '@/lib/utils'

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
  imageUrls: string
  approvalStatus: string
  approvalNotes: string | null
  createdAt: string
  scheduledPosts: Array<{
    id: string
    scheduledDate: string
    scheduledTime: string
    status: string
    platform: string
  }>
}

const APPROVAL_CONFIG = {
  pending:  { label: 'Pending Review', color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', icon: Clock },
  approved: { label: 'Approved',       color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7', icon: CheckCircle },
  rejected: { label: 'Rejected',       color: '#991B1B', bg: '#FEE2E2', border: '#FCA5A5', icon: XCircle },
}

function ApprovalBanner({ status, notes }: { status: string; notes: string | null }) {
  const cfg = APPROVAL_CONFIG[status as keyof typeof APPROVAL_CONFIG] ?? APPROVAL_CONFIG.pending
  const Icon = cfg.icon
  return (
    <div className="rounded-xl px-5 py-4 flex items-start gap-3 mb-6"
      style={{ backgroundColor: cfg.bg, border: `2px solid ${cfg.border}` }}>
      <Icon size={20} style={{ color: cfg.color, marginTop: 1, flexShrink: 0 }} />
      <div>
        <p className="font-semibold text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
        {notes && <p className="text-sm mt-0.5" style={{ color: cfg.color, opacity: 0.8 }}>{notes}</p>}
      </div>
    </div>
  )
}

function PlatformPicker({ value, onChange }: { value: string[], onChange: (v: string[]) => void }) {
  function toggle(p: string) {
    onChange(value.includes(p) ? value.filter(x => x !== p) : [...value, p])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map(p => (
        <button key={p.value} type="button" onClick={() => toggle(p.value)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          style={value.includes(p.value)
            ? { backgroundColor: p.color, color: '#fff', borderColor: p.color }
            : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
          }>
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function IdeaDetailClient({ idea: initialIdea }: { idea: Idea }) {
  const [idea, setIdea] = useState(initialIdea)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: idea.title,
    description: idea.description ?? '',
    platforms: parsePlatforms(idea.platform),
    pillar: idea.pillar ?? '',
    priority: idea.priority,
    status: idea.status,
    notes: idea.notes ?? '',
    caption: idea.caption ?? '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const images: string[] = JSON.parse(idea.imageUrls || '[]')
  const platforms = parsePlatforms(idea.platform)

  async function handleSave() {
    const res = await fetch(`/api/ideas/${idea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, platform: JSON.stringify(form.platforms) }),
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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Upload failed')
        newUrls.push(data.url)
      }
      const merged = [...images, ...newUrls]
      await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: merged }),
      })
      setIdea(prev => ({ ...prev, imageUrls: JSON.stringify(merged) }))
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveImage(url: string) {
    const updated = images.filter(u => u !== url)
    await fetch(`/api/ideas/${idea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrls: updated }),
    })
    setIdea(prev => ({ ...prev, imageUrls: JSON.stringify(updated) }))
  }

  return (
    <div>
      <ApprovalBanner status={idea.approvalStatus} notes={idea.approvalNotes} />

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editing ? (
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="text-2xl font-semibold w-full border-b-2 pb-1 focus:outline-none"
              style={{ borderColor: '#C9A84C', color: '#2C3D2E' }} />
          ) : (
            <h1 className="text-2xl font-semibold" style={{ color: '#2C3D2E' }}>{idea.title}</h1>
          )}
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Added {format(new Date(idea.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          {editing ? (
            <>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#2C3D2E', color: '#C9A84C' }}>
                <Check size={14} /> Save
              </button>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">
                <X size={14} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Status', content: editing
            ? <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                {['idea','draft','scheduled','posted'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>{idea.status}</span>
          },
          { label: 'Priority', content: editing
            ? <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                {['low','medium','high'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[idea.priority]}`}>{idea.priority}</span>
          },
          { label: 'Pillar', content: editing
            ? <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))} className="w-full text-sm border-0 bg-transparent focus:outline-none">
                <option value="">None</option>
                {PILLARS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            : <span className="text-sm font-medium capitalize" style={{ color: '#2C3D2E' }}>{idea.pillar || '—'}</span>
          },
        ].map(({ label, content }) => (
          <div key={label} className="rounded-xl border p-4" style={{ backgroundColor: '#fff', borderColor: '#E8E0CC' }}>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#8B7355' }}>{label}</p>
            {content}
          </div>
        ))}
      </div>

      {/* Platforms */}
      <div className="rounded-xl border p-5 mb-4" style={{ backgroundColor: '#fff', borderColor: '#E8E0CC' }}>
        <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8B7355' }}>Platforms</p>
        {editing
          ? <PlatformPicker value={form.platforms} onChange={p => setForm(f => ({ ...f, platforms: p }))} />
          : <div className="flex flex-wrap gap-1.5">
              {platforms.map(p => {
                const found = PLATFORMS.find(pl => pl.value === p)
                return <span key={p} className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: found?.color ?? '#6B7280' }}>{found?.label ?? p}</span>
              })}
            </div>
        }
      </div>

      <div className="space-y-4">
        {([
          { label: 'Description', field: 'description' as const },
          { label: 'Caption Draft', field: 'caption' as const },
          { label: 'Notes', field: 'notes' as const },
        ] as const).map(({ label, field }) => (
          <div key={field} className="rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E8E0CC' }}>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: '#8B7355' }}>{label}</p>
            {editing ? (
              <textarea value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                rows={3} className="w-full text-sm border-0 focus:outline-none resize-none" style={{ color: '#2C3D2E' }}
                placeholder={`Add ${label.toLowerCase()}...`} />
            ) : (
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>
                {(idea[field] as string) || <span style={{ color: '#D1D5DB' }}>None</span>}
              </p>
            )}
          </div>
        ))}

        {/* Image uploads */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E8E0CC' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wide" style={{ color: '#8B7355' }}>
              Uploaded Content ({images.length})
            </p>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                onChange={handleUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#2C3D2E', color: '#C9A84C' }}>
                {uploading
                  ? <><Loader size={12} className="animate-spin" /> Uploading...</>
                  : <><Upload size={12} /> Upload</>}
              </button>
            </div>
          </div>
          {images.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl py-10 text-center cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderColor: '#E8E0CC' }} onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={28} className="mx-auto mb-2" style={{ color: '#C9A84C' }} />
              <p className="text-sm" style={{ color: '#6B7280' }}>Click to upload images or video</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>PNG, JPG, MP4 supported</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Upload ${i + 1}`}
                    className="w-full h-36 object-cover rounded-lg border" style={{ borderColor: '#E8E0CC' }} />
                  <button onClick={() => handleRemoveImage(url)}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={11} />
                  </button>
                </div>
              ))}
              <div className="h-36 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                style={{ borderColor: '#E8E0CC' }} onClick={() => fileInputRef.current?.click()}>
                <div className="text-center">
                  <Upload size={18} className="mx-auto mb-1" style={{ color: '#C9A84C' }} />
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Add more</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {idea.scheduledPosts.length > 0 && (
          <div className="rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E8E0CC' }}>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8B7355' }}>Scheduled Posts</p>
            <div className="space-y-2">
              {idea.scheduledPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: '#374151' }}>
                    {format(new Date(post.scheduledDate), 'MMMM d, yyyy')} at {post.scheduledTime}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[post.status]}`}>
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
