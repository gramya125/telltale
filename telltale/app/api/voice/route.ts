import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, text } = await request.json();

    switch (action) {
      case 'text-to-speech':
        // For now, we'll return instructions for the frontend to handle TTS
        // In a production environment, you might want to use a service like ElevenLabs or Azure Speech
        return NextResponse.json({
          success: true,
          message: 'Use browser TTS',
          text: text
        });

      case 'speech-to-text':
        // This would typically integrate with a speech-to-text service
        // For now, we'll rely on the browser's Web Speech API
        return NextResponse.json({
          success: true,
          message: 'Use browser STT'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'TellTale Voice API is running',
    actions: ['text-to-speech', 'speech-to-text']
  });
}