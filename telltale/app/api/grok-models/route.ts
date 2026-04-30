import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const grokApiKey = process.env.GROK_API_KEY;
    const grokApiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1';

    if (!grokApiKey) {
      return NextResponse.json({
        error: 'GROK_API_KEY not set'
      }, { status: 500 });
    }

    // Try to get list of models
    const response = await fetch(`${grokApiUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Models API status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Failed to fetch models',
        status: response.status,
        details: errorText,
        suggestion: 'Try these common models: grok-2-1212, grok-vision-beta, grok-2-latest'
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      models: data,
      availableModels: data.data?.map((m: any) => m.id) || []
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Common Grok models to try: grok-2-1212, grok-vision-beta, grok-2-latest'
    }, { status: 500 });
  }
}
