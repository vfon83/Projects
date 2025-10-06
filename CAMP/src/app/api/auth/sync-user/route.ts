import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json()

    await prisma.user.upsert({
      where: { id },
      update: { email, name },
      create: {
        id,
        email,
        name: name || email?.split('@')[0] || 'User',
        role: 'engineer',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 })
  }
}