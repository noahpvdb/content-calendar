import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  let where = {}
  if (month) {
    const [year, m] = month.split('-').map(Number)
    const start = new Date(year, m - 1, 1)
    const end = new Date(year, m, 0, 23, 59, 59)
    where = { scheduledDate: { gte: start, lte: end } }
  }

  const posts = await prisma.scheduledPost.findMany({
    where,
    include: { idea: true },
    orderBy: { scheduledDate: 'asc' },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const post = await prisma.scheduledPost.create({
    data: {
      ideaId: body.ideaId,
      scheduledDate: new Date(body.scheduledDate),
      scheduledTime: body.scheduledTime ?? '09:00',
      platform: body.platform,
      status: body.status ?? 'scheduled',
      caption: body.caption ?? null,
    },
    include: { idea: true },
  })
  return NextResponse.json(post, { status: 201 })
}
