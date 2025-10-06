import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { PrismaClient } from "@prisma/client"
import { analyzeDocument } from '@/ai/flows/analyze-document'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { documentId, projectId } = await request.json()

    if (!documentId || !projectId) {
      return NextResponse.json(
        { error: "Document ID and project ID are required" },
        { status: 400 }
      )
    }

    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Get file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(document.filePath)

    if (fileError) {
      throw new Error('Failed to download file')
    }

    // Convert file to text (you'll need to implement this based on file type)
    const text = await fileData.text()

    // Analyze with Gemini (Genkit)
    const analysisResult = await analyzeDocument({ documentText: text })

    // Save analysis to extractedInfo field
    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedInfo: {
          analysis: analysisResult.summary,
          keyPoints: analysisResult.keyPoints,
          recommendations: analysisResult.recommendations,
        },
      },
    })

    return NextResponse.json({ analysis: analysisResult })
  } catch (error) {
    console.error("Error analyzing document:", error)
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    )
  }
} 