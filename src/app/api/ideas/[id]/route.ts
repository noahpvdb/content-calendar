import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const idea = await prisma.contentIdea.findUnique({
    where: { id },
    include: { scheduledPosts: { orderBy: { scheduledDate: 'asc' } } },
  })
  if (!idea) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(idea)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const idea = await prisma.contentIdea.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.platform !== undefined ? { platform: body.platform } : {}),
      ...(body.pillar !== undefined ? { pillar: body.pillar } : {}),
      ...(body.tags !== undefined ? { tags: JSON.stringify(body.tags) } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.caption !== undefined ? { caption: body.caption } : {}),
    },
  })
  return NextResponse.json(idea)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.contentIdea.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
