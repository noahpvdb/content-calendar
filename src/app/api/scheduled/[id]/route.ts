import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const post = await prisma.scheduledPost.update({
    where: { id },
    data: {
      ...(body.scheduledDate !== undefined ? { scheduledDate: new Date(body.scheduledDate) } : {}),
      ...(body.scheduledTime !== undefined ? { scheduledTime: body.scheduledTime } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.caption !== undefined ? { caption: body.caption } : {}),
    },
    include: { idea: true },
  })
  return NextResponse.json(post)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.scheduledPost.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
