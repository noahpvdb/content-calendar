import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platform = searchParams.get('platform')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const ideas = await prisma.contentIdea.findMany({
    where: {
      ...(platform && platform !== 'all' ? { platform } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ]
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { scheduledPosts: true },
  })

  return NextResponse.json(ideas)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const idea = await prisma.contentIdea.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      platform: body.platform,
      pillar: body.pillar ?? null,
      tags: JSON.stringify(body.tags ?? []),
      priority: body.priority ?? 'medium',
      status: body.status ?? 'idea',
      notes: body.notes ?? null,
      caption: body.caption ?? null,
      imageUrls: JSON.stringify(body.imageUrls ?? []),
    },
  })
  return NextResponse.json(idea, { status: 201 })
}
