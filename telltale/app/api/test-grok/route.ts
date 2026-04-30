import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqApiUrl = process.env.GROQ_API_URL;

  return NextResponse.json({
    status: 'Environment Variables Check',
    groqApiUrl: groqApiUrl || 'NOT SET',
    groqApiKeyPresent: !!groqApiKey,
    groqApiKeyLength: groqApiKey?.length || 0,
    groqApiKeyPrefix: groqApiKey?.substring(0, 10) || 'NOT SET',
    allEnvVars: {
      GROQ_API_URL: process.env.GROQ_API_URL,
      GROQ_API_KEY_EXISTS: !!process.env.GROQ_API_KEY,
      ML_API_URL: process.env.ML_API_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const groqApiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';

    console.log('🧪 TEST: Calling Groq API...');
    console.log('🧪 TEST: API URL:', groqApiUrl);
    console.log('🧪 TEST: API Key present:', !!groqApiKey);
    console.log('🧪 TEST: API Key length:', groqApiKey?.length || 0);

    if (!groqApiKey) {
      return NextResponse.json({
        error: 'GROQ_API_KEY not set in environment variables',
        groqApiUrl,
      }, { status: 500 });
    }

    const requestBody = {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello from Groq!" if you can hear me.' }
      ],
      model: 'llama-3.3-70b-versatile',
      stream: false,
      temperature: 0.7,
      max_tokens: 50,
    };

    console.log('🧪 TEST: Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${groqApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });

    console.log('🧪 TEST: Response status:', response.status);
    console.log('🧪 TEST: Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('🧪 TEST: Response body:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json({
        error: 'Failed to parse response as JSON',
        status: response.status,
        responseText: responseText.substring(0, 500),
        groqApiUrl,
      }, { status: 500 });
    }

    if (!response.ok) {
      return NextResponse.json({
        error: 'Groq API returned error',
        status: response.status,
        data,
        groqApiUrl,
        groqApiKeyPrefix: groqApiKey.substring(0, 10),
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      groqApiUrl,
      groqApiKeyPrefix: groqApiKey.substring(0, 10),
      response: data.choices?.[0]?.message?.content || 'No content',
      fullResponse: data,
    });

  } catch (error) {
    console.error('🧪 TEST: Error:', error);
    return NextResponse.json({
      error: 'Exception occurred',
      message: error instanceof Error ? error.message : 'Unknown error',
      groqApiUrl: process.env.GROQ_API_URL,
    }, { status: 500 });
  }
}
