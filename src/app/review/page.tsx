'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { getPlatformsLabel, parsePlatforms, PLATFORMS, STATUS_COLORS } from '@/lib/utils'

type Idea = {
  id: string
  title: string
  description: string | null
  platform: string
  pillar: string | null
  priority: string
  status: string
  caption: string | null
  notes: string | null
  imageUrls: string
  approvalStatus: string
  approvalNotes: string | null
  createdAt: string
}

const APPROVAL_CONFIG = {
  pending:  { label: 'Pending Review', color: '#B45309', bg: '#FEF3C7', border: '#FCD34D', icon: Clock },
  approved: { label: 'Approved',       color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7', icon: CheckCircle },
  rejected: { label: 'Rejected',       color: '#991B1B', bg: '#FEE2E2', border: '#FCA5A5', icon: XCircle },
}

function ApprovalBadge({ status }: { status: string }) {
  const cfg = APPROVAL_CONFIG[status as keyof typeof APPROVAL_CONFIG] ?? APPROVAL_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

function IdeaCard({ idea, onApprove, onReject, onReset }: {
  idea: Idea
  onApprove: (id: string, notes: string) => Promise<void>
  onReject: (id: string, notes: string) => Promise<void>
  onReset: (id: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(idea.approvalStatus === 'pending')
  const [notes, setNotes] = useState(idea.approvalNotes ?? '')
  const [loading, setLoading] = useState(false)
  const images: string[] = JSON.parse(idea.imageUrls || '[]')
  const platforms = parsePlatforms(idea.platform)
  const cfg = APPROVAL_CONFIG[idea.approvalStatus as keyof typeof APPROVAL_CONFIG] ?? APPROVAL_CONFIG.pending

  async function handle(fn: (id: string, notes: string) => Promise<void>) {
    setLoading(true)
    await fn(idea.id, notes)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm transition-all"
      style={{ border: `2px solid ${cfg.border}`, backgroundColor: '#fff' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: cfg.bg }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base">{idea.title}</h3>
            <ApprovalBadge status={idea.approvalStatus} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-500">{getPlatformsLabel(idea.platform)}</span>
            {idea.pillar && <span className="text-xs text-gray-400 capitalize">• {idea.pillar}</span>}
            <span className="text-xs text-gray-400">• Added {format(new Date(idea.createdAt), 'MMM d')}</span>
            {images.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <ImageIcon size={11} /> {images.length} image{images.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="shrink-0 p-1.5 rounded-lg hover:bg-black/10 transition-colors">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-5 space-y-4">
          {/* Images */}
          {images.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Uploaded Content</p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Upload ${i + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Platform tags */}
          <div className="flex flex-wrap gap-1.5">
            {platforms.map(p => {
              const found = PLATFORMS.find(pl => pl.value === p)
              return (
                <span key={p} className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: found?.color ?? '#6B7280' }}>
                  {found?.label ?? p}
                </span>
              )
            })}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[idea.status]}`}>
              {idea.status}
            </span>
          </div>

          {/* Description */}
          {idea.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700">{idea.description}</p>
            </div>
          )}

          {/* Caption */}
          {idea.caption && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Caption Draft</p>
              <p className="text-sm text-gray-700 italic bg-gray-50 rounded-lg p-3 border border-gray-100">"{idea.caption}"</p>
            </div>
          )}

          {/* Notes */}
          {idea.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-600">{idea.notes}</p>
            </div>
          )}

          {/* Approval notes */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {idea.approvalStatus === 'pending' ? 'Feedback (optional)' : 'Feedback'}
            </p>
            {idea.approvalStatus === 'pending' ? (
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#C9A84C' } as React.CSSProperties}
                placeholder="Add feedback for the content team..."
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {idea.approvalNotes || <span className="text-gray-400 italic">No feedback provided</span>}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            {idea.approvalStatus === 'pending' && (
              <>
                <button
                  disabled={loading}
                  onClick={() => handle(onApprove)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#065F46', color: '#fff' }}
                >
                  <CheckCircle size={15} /> Approve
                </button>
                <button
                  disabled={loading}
                  onClick={() => handle(onReject)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#991B1B', color: '#fff' }}
                >
                  <XCircle size={15} /> Reject
                </button>
              </>
            )}
            {idea.approvalStatus !== 'pending' && (
              <button
                disabled={loading}
                onClick={() => handle(() => onReset(idea.id))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: '#E5E7EB', color: '#6B7280' }}
              >
                <Clock size={14} /> Reset to Pending
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReviewPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const fetchIdeas = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/ideas')
    setIdeas(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  async function handleApprove(id: string, approvalNotes: string) {
    await fetch(`/api/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'approved', approvalNotes }),
    })
    fetchIdeas()
  }

  async function handleReject(id: string, approvalNotes: string) {
    await fetch(`/api/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'rejected', approvalNotes }),
    })
    fetchIdeas()
  }

  async function handleReset(id: string) {
    await fetch(`/api/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus: 'pending', approvalNotes: '' }),
    })
    fetchIdeas()
  }

  const filtered = filter === 'all' ? ideas : ideas.filter(i => i.approvalStatus === filter)
  const counts = {
    all: ideas.length,
    pending: ideas.filter(i => i.approvalStatus === 'pending').length,
    approved: ideas.filter(i => i.approvalStatus === 'approved').length,
    rejected: ideas.filter(i => i.approvalStatus === 'rejected').length,
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold" style={{ color: '#2C3D2E' }}>Content Review</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Approve or reject content ideas before they go live</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => {
          const cfg = f === 'all'
            ? { label: 'All', color: '#374151', bg: '#F3F4F6', border: '#E5E7EB', activeBg: '#2C3D2E', activeColor: '#C9A84C' }
            : { ...APPROVAL_CONFIG[f], activeBg: APPROVAL_CONFIG[f].bg, activeColor: APPROVAL_CONFIG[f].color }
          const isActive = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={isActive
                ? { backgroundColor: f === 'all' ? '#2C3D2E' : APPROVAL_CONFIG[f as keyof typeof APPROVAL_CONFIG].bg,
                    color: f === 'all' ? '#C9A84C' : APPROVAL_CONFIG[f as keyof typeof APPROVAL_CONFIG].color,
                    borderColor: f === 'all' ? '#2C3D2E' : APPROVAL_CONFIG[f as keyof typeof APPROVAL_CONFIG].border,
                    fontWeight: 600 }
                : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
              }
            >
              {f === 'all' ? 'All' : APPROVAL_CONFIG[f].label} <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: '#9CA3AF' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: '#fff', border: '1px solid #E8E0CC' }}>
          <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#C9A84C' }} />
          <p className="font-medium" style={{ color: '#2C3D2E' }}>
            {filter === 'pending' ? 'Nothing pending review' : `No ${filter} items`}
          </p>
          <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            {filter === 'pending' ? 'All caught up!' : 'Change the filter above to see other items'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onApprove={handleApprove}
              onReject={handleReject}
              onReset={handleReset}
            />
          ))}
        </div>
      )}
    </div>
  )
}
