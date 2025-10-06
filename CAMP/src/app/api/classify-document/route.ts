import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { documentDataUri } = await request.json();

    if (!documentDataUri) {
      return NextResponse.json(
        { error: 'Document data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `Analyze this construction document and classify it into one of these categories:
    - Construction (for general construction plans, blueprints, etc.)
    - MEP (for mechanical, electrical, plumbing plans)
    - Code/Specification Sheets (for building codes, specifications, etc.)
    - Unknown (if the document doesn't fit any of the above categories)
    
    Respond with ONLY the category name, nothing else.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: documentDataUri.split(',')[1],
        },
      },
    ]);

    const response = await result.response;
    const category = response.text().trim();

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Error classifying document:', error);
    return NextResponse.json(
      { error: 'Failed to classify document' },
      { status: 500 }
    );
  }
} 