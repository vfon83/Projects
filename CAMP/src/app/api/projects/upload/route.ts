import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from '@supabase/ssr'
import { PrismaClient } from "@prisma/client"
import type { Document } from '@/lib/types'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Get Supabase session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: "Unauthorized", details: authError?.message },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received request body:', body)
    
    const { projectId, document } = body
    console.log('Parsed document:', { 
      projectId, 
      documentId: document?.id, 
      documentName: document?.name,
      classification: document?.classification,
      size: document?.size 
    })

    if (!projectId || !document) {
      console.error('Missing fields:', { projectId, hasDocument: !!document })
      return NextResponse.json(
        { error: 'Missing required fields', received: { projectId, document } },
        { status: 400 }
      )
    }

    // Verify project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: true }
    })

    if (!project) {
      console.error('Project not found:', projectId)
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user is a member of the project
    const isMember = project.teamLeadId === user.id || 
                    project.teamMembers.some(member => member.id === user.id)
    if (!isMember) {
      console.error('User not a member:', { userId: user.id, projectId })
      return NextResponse.json(
        { error: 'Unauthorized access to project' },
        { status: 403 }
      )
    }

    // Save document to database
    try {
      const savedDocument = await prisma.document.create({
        data: {
          id: document.id,
          name: document.name,
          classification: document.classification,
          uploadDate: new Date(),
          extractedInfo: document.extractedInfo || {},
          annotations: document.annotations || [],
          projectId: projectId,
          uploadedById: user.id,
          filePath: document.filePath || '',
          fileType: document.fileType || '',
          dataUri: document.dataUri || '',
          size: document.size || 0,
          status: 'pending',
          reviewers: []
        }
      })

      console.log('Document saved successfully:', savedDocument.id)
      return NextResponse.json({ 
        success: true,
        document: savedDocument
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Database error: ' + (dbError instanceof Error ? dbError.message : 'Unknown error') },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error saving document:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save document' },
      { status: 500 }
    )
  }
}