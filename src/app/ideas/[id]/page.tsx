import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { IdeaDetailClient } from './IdeaDetailClient'

export const dynamic = 'force-dynamic'

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const idea = await prisma.contentIdea.findUnique({
    where: { id },
    include: { scheduledPosts: { orderBy: { scheduledDate: 'asc' } } },
  })
  if (!idea) notFound()

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <Link href="/ideas" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Ideas
      </Link>
      <IdeaDetailClient idea={JSON.parse(JSON.stringify(idea))} />
    </div>
  )
}
