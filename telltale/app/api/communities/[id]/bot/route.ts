import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// ── Groq call ──────────────────────────────────────────────────────────────
async function callGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqApiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';

  if (!groqApiKey) throw new Error('GROQ_API_KEY not set');

  const response = await fetch(`${groqApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      stream: false,
      temperature: 0.85,
      max_tokens: 180,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return (data.choices[0]?.message?.content || '').trim();
}

// ── Fallback when Groq is unavailable ─────────────────────────────────────
function fallbackReply(triggerMessage: string): string {
  const msg = triggerMessage.toLowerCase();

  // Contextual fallbacks based on keywords
  if (/\b(finish|finished|done|completed|read)\b/.test(msg)) {
    return "That's awesome you finished it! 📖 What was the moment that stuck with you the most — and would you recommend it to someone who's never read that genre before?";
  }
  if (/\b(recommend|suggest|what should|what to read)\b/.test(msg)) {
    return "Great question! 🤔 What genres or themes are you in the mood for right now? That'll help narrow it down — cozy mystery, epic fantasy, or something that'll make you think?";
  }
  if (/\b(love|loved|amazing|great|fantastic|brilliant|incredible)\b/.test(msg)) {
    return "Love the enthusiasm! ✨ What specifically made it click for you — the writing style, the characters, or the plot? And did it remind you of anything else you've read?";
  }
  if (/\b(hate|hated|boring|terrible|bad|disappointing|overrated)\b/.test(msg)) {
    return "Interesting take! 🔥 What were you expecting going in, and where did it fall short? Sometimes the most disappointing reads spark the best discussions.";
  }
  if (/\b(character|protagonist|villain|hero)\b/.test(msg)) {
    return "Characters make or break a book for me too! 🎭 Did you find yourself rooting for them, or were they the kind you love to hate? What would you change about them?";
  }
  if (/\b(ending|end|finale|conclusion|last chapter)\b/.test(msg)) {
    return "Endings are everything! 🎬 Did it feel earned, or did it leave you wanting more? I always wonder — open endings or satisfying conclusions, which do you prefer?";
  }
  if (/\?/.test(msg)) {
    return "Great question for the group! 💬 I'd love to hear everyone's take on this. What's your gut feeling — and has a book ever completely changed your mind on the topic?";
  }

  // Generic fallback
  const generic = [
    "That's a really interesting point! 🤔 What book first got you into reading seriously, and do you think it still holds up today?",
    "Love this discussion! 📚 Quick question for everyone — do you prefer reading one book at a time, or are you a multi-book juggler?",
    "This is exactly the kind of conversation I love! ✨ What's a book you think is criminally underrated that more people should know about?",
    "Fascinating! 🌟 Fun fact: the average reader finishes about 12 books a year — are you above or below that? And what's your current read?",
    "Great point! 💡 Here's a thought — if this book were made into a film, who would you cast as the lead? And would you actually watch it?",
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

// ── Build the system prompt ────────────────────────────────────────────────
function buildSystemPrompt(
  communityName: string,
  communityCategory: string,
  recentHistory: string
): string {
  return `You are TellTale Bot, a lively and knowledgeable AI participant in the "${communityName}" book community (category: ${communityCategory}).

Your job is to respond to EVERY message from a user. You must:
1. Acknowledge or react to what they just said (1 sentence — be specific, not generic)
2. Add a relevant book fact, insight, or your own perspective (1 sentence)
3. End with a follow-up question that invites the group to keep talking (1 sentence)

Tone: warm, curious, enthusiastic about books — like a well-read friend, not a librarian.
Length: 2–3 sentences MAX. Never write a wall of text.
Style: conversational, use emojis sparingly (1–2 max), never start with "I" or "As an AI".

Recent conversation for context:
${recentHistory || '(no prior messages)'}

Rules:
- Always respond to the specific thing the user said — never give a generic reply
- If they mention a book title, engage with that book specifically
- If they ask a question, answer it briefly then ask one back
- If they share an opinion, validate it and add a counterpoint or related fact
- Never repeat a question you already asked in the recent history`;
}

// ── POST handler ───────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, triggerMessage } = body;
    const communityId = params.id;

    const db = await getDatabase();

    // ── auto_reply: called after every user message ──
    if (action === 'auto_reply') {
      // Fetch last 15 messages for context
      const recent = await db
        .collection('messages')
        .find({ communityId })
        .sort({ createdAt: -1 })
        .limit(15)
        .toArray();

      const ordered = [...recent].reverse();

      // Build readable history string
      const historyStr = ordered
        .slice(-8)
        .map(m => `${m.username}: ${m.message}`)
        .join('\n');

      // Get community info
      let communityName = 'Book Community';
      let communityCategory = 'Books';
      try {
        const community = await db
          .collection('communities')
          .findOne({ _id: params.id as any });
        if (community) {
          communityName = community.name || communityName;
          communityCategory = community.genre || community.category || communityCategory;
        }
      } catch {}

      const systemPrompt = buildSystemPrompt(communityName, communityCategory, historyStr);
      const userPrompt = `The latest message from a community member is: "${triggerMessage}"\n\nRespond to this message directly. Acknowledge what they said, add a book-related insight or fact, and ask a follow-up question.`;

      let botResponse: string;
      try {
        botResponse = await callGroq(systemPrompt, userPrompt);
        if (!botResponse) throw new Error('Empty response');
      } catch (err) {
        console.error('Groq failed, using fallback:', err);
        botResponse = fallbackReply(triggerMessage || '');
      }

      // Save to DB
      await db.collection('messages').insertOne({
        communityId,
        userId: 'telltale-bot',
        username: 'TellTale Bot',
        avatar: '',
        message: botResponse,
        createdAt: new Date(),
        type: 'bot',
      });

      return NextResponse.json({ shouldReply: true, message: botResponse });
    }

    // ── Legacy compatibility ──
    if (action === 'check_auto_participation' || action === 'manual_message') {
      const recent = await db
        .collection('messages')
        .find({ communityId })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      const ordered = [...recent].reverse();
      const historyStr = ordered.map(m => `${m.username}: ${m.message}`).join('\n');
      const systemPrompt = buildSystemPrompt('Book Community', 'Books', historyStr);
      const userPrompt = 'The conversation has been quiet. Start an engaging discussion about books with a question or interesting fact.';

      let botResponse: string;
      try {
        botResponse = await callGroq(systemPrompt, userPrompt);
        if (!botResponse) throw new Error('Empty');
      } catch {
        botResponse = fallbackReply('');
      }

      const result = await db.collection('messages').insertOne({
        communityId,
        userId: 'telltale-bot',
        username: 'TellTale Bot',
        avatar: '',
        message: botResponse,
        createdAt: new Date(),
        type: 'bot',
      });

      return NextResponse.json({
        success: true,
        shouldParticipate: true,
        message: botResponse,
        messageId: result.insertedId.toString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Community bot error:', error);
    return NextResponse.json({ error: 'Failed to process bot request' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    message: 'TellTale Community Bot — responds to every user message',
    communityId: params.id,
  });
}
