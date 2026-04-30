import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RecommendationRequest {
  user_id: string;
  preferences?: string[];
  genre?: string;
  limit?: number;
}

// Function to get recommendations from ML API
async function getRecommendations(userId: string, preferences?: string[], genre?: string): Promise<any[]> {
  try {
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8001';
    console.log('🔗 Connecting to ML API:', mlApiUrl);
    
    // First try to get personalized recommendations
    const response = await fetch(`${mlApiUrl}/recommend/${userId}?top_n=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    console.log('📊 ML API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ ML API recommendations:', data);
      return data.recommendations || data;
    } else {
      console.warn('⚠️ ML API returned non-OK status, trying fallback');
      // Fallback to popular books
      const popularResponse = await fetch(`${mlApiUrl}/popular?top_n=5`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (popularResponse.ok) {
        const data = await popularResponse.json();
        return data.recommendations || [];
      }
    }
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      // Check if it's a connection error
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        console.warn('⚠️ ML API is not running. Please start it with: cd ml && uvicorn main:app --reload --port 8001');
      }
    }
  }
  
  // Return empty array if all attempts fail
  console.log('⚠️ Returning empty recommendations array');
  return [];
}

// Function to call Groq API
async function callGroqAPI(messages: ChatMessage[]): Promise<string> {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    const groqApiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';

    console.log('🤖 Calling Groq API...');
    console.log('API URL:', groqApiUrl);
    console.log('API Key present:', !!groqApiKey);
    console.log('API Key length:', groqApiKey?.length || 0);

    if (!groqApiKey || groqApiKey.trim() === '') {
      console.error('❌ Groq API key not configured');
      return 'I apologize, but my AI service is not properly configured. Please contact the administrator to set up the GROQ_API_KEY.';
    }

    const requestBody = {
      messages: messages,
      model: 'llama-3.3-70b-versatile', // Free, fast, and powerful
      stream: false,
      temperature: 0.7,
      max_tokens: 500,
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${groqApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error response:', errorText);
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key - please check your Groq API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again in a moment');
      } else if (response.status === 500) {
        throw new Error('Groq API server error - please try again later');
      } else {
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Groq API response:', data);

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('❌ No content in Groq response:', data);
      throw new Error('No content received from Groq API');
    }

    return content;
  } catch (error) {
    console.error('❌ Error calling Groq API:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'I\'m having trouble with my API configuration. Please check that the Groq API key is set up correctly.';
      } else if (error.message.includes('Rate limit')) {
        return 'I\'m getting too many requests right now. Please wait a moment and try again! 😅';
      } else if (error.message.includes('server error')) {
        return 'The AI service is temporarily unavailable. Please try again in a few minutes! 🔧';
      } else if (error.message.includes('fetch')) {
        return 'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.';
      }
    }
    
    return 'I\'m experiencing some technical difficulties right now. Please try again in a moment! 🤖';
  }
}

// Function to detect if user is asking for book recommendations
function isRecommendationRequest(message: string): boolean {
  const recommendationKeywords = [
    'recommend', 'suggestion', 'book', 'read', 'reading',
    'genre', 'author', 'similar', 'like', 'enjoy',
    'fiction', 'non-fiction', 'mystery', 'romance', 'thriller'
  ];
  
  const lowerMessage = message.toLowerCase();
  return recommendationKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Function to extract preferences from user message
function extractPreferences(message: string): { genre?: string; preferences: string[] } {
  const genres = ['fiction', 'non-fiction', 'mystery', 'romance', 'thriller', 'fantasy', 'sci-fi', 'biography', 'history'];
  const lowerMessage = message.toLowerCase();
  
  const foundGenre = genres.find(genre => lowerMessage.includes(genre));
  const preferences: string[] = [];
  
  // Extract other preferences
  if (lowerMessage.includes('popular')) preferences.push('popular');
  if (lowerMessage.includes('new') || lowerMessage.includes('recent')) preferences.push('recent');
  if (lowerMessage.includes('classic')) preferences.push('classic');
  
  return { genre: foundGenre, preferences };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Chat API: Received request');
    
    const session = await getServerSession(authOptions);
    const { message, conversationHistory = [] } = await request.json();

    console.log('👤 User session:', session?.user?.email || 'anonymous');
    console.log('💬 Message:', message);

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if this is a recommendation request
    const isRecommendation = isRecommendationRequest(message);
    let response = '';
    let recommendations: any[] = [];

    console.log('🔍 Is recommendation request:', isRecommendation);

    if (isRecommendation && session?.user?.email) {
      // Get recommendations from ML model
      const { genre, preferences } = extractPreferences(message);
      console.log('🎯 Extracted preferences:', { genre, preferences });
      
      recommendations = await getRecommendations(session.user.email, preferences, genre);
      console.log('📚 Got recommendations:', recommendations.length);
      
      if (recommendations.length > 0) {
        // Create a context-aware prompt for Grok
        const systemPrompt = `You are TellTale's AI book assistant. You help users discover great books. 
        The user asked: "${message}"
        
        Here are personalized book recommendations from our ML model:
        ${recommendations.map((book, index) => 
          `${index + 1}. ${book.title} (${book.genre}) - Score: ${book.score}`
        ).join('\n')}
        
        Please provide a friendly, conversational response that:
        1. Acknowledges their request
        2. Presents these recommendations in an engaging way
        3. Explains why these books might interest them
        4. Asks if they'd like more specific recommendations
        
        Keep it conversational and enthusiastic about books!`;

        const messages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ];

        response = await callGroqAPI(messages);
      } else {
        console.log('⚠️ No recommendations available, using fallback');
        // Fallback response when no recommendations available
        const fallbackPrompt = `You are TellTale's AI book assistant. The user asked: "${message}"
        
        Unfortunately, I couldn't fetch personalized recommendations right now, but I can still help! 
        Please provide general book recommendations based on their request and ask what specific genres or types of books they're interested in.`;

        const messages: ChatMessage[] = [
          { role: 'system', content: fallbackPrompt },
          { role: 'user', content: message }
        ];

        response = await callGroqAPI(messages);
      }
    } else {
      console.log('💭 General conversation mode');
      // General conversation - not specifically about recommendations
      const systemPrompt = `You are TellTale's AI assistant, a friendly and knowledgeable book companion. You help users with:
      - Book recommendations and discovery
      - Reading advice and tips
      - Book discussions and reviews
      - General questions about literature
      - Navigation help for the TellTale platform
      
      Keep responses helpful, engaging, and book-focused. If users ask about non-book topics, gently redirect them back to books and reading.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-5), // Keep last 5 messages for context
        { role: 'user', content: message }
      ];

      response = await callGroqAPI(messages);
    }

    console.log('✅ Sending response back to client');

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      isRecommendation,
      recommendations: isRecommendation ? recommendations : undefined
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'TellTale Chat API is running',
    endpoints: {
      POST: 'Send a chat message',
    }
  });
}