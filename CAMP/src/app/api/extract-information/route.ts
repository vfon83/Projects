import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { PlanType } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { planDataUri, planType } = await request.json();

    if (!planDataUri || !planType) {
      return NextResponse.json(
        { error: 'Document data and plan type are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const prompt = `Analyze this ${planType} document and extract the following information:
    1. Material schedules (list of materials and quantities)
    2. Equipment specifications (list of equipment and their specifications)
    3. Spatial dimensions (measurements and dimensions mentioned)
    
    Format the response as a JSON object with these keys:
    {
      "materialSchedules": "string",
      "equipmentSpecifications": "string",
      "spatialDimensions": "string"
    }
    
    If any information is not found, use an empty string for that key.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: planDataUri.split(',')[1],
        },
      },
    ]);

    const response = await result.response;
    const extractedInfo = JSON.parse(response.text());

    return NextResponse.json(extractedInfo);
  } catch (error) {
    console.error('Error extracting information:', error);
    return NextResponse.json(
      { error: 'Failed to extract information' },
      { status: 500 }
    );
  }
} 