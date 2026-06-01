import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  const now = new Date()

  const [totalIdeas, weekPosts, monthPosts, recentIdeas] = await Promise.all([
    prisma.contentIdea.count(),
    prisma.scheduledPost.count({
      where: {
        scheduledDate: {
          gte: startOfWeek(now),
          lte: endOfWeek(now),
        },
      },
    }),
    prisma.scheduledPost.count({
      where: {
        scheduledDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    }),
    prisma.contentIdea.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return NextResponse.json({ totalIdeas, weekPosts, monthPosts, recentIdeas })
}
