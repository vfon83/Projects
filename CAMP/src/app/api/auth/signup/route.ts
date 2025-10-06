import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'engineer', // Default role
        accounts: {
          create: {
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: email,
            access_token: hashedPassword,
          }
        }
      },
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'This email is already registered' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
} 