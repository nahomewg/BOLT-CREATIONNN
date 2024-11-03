// app/api/chat/route.js
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    console.log('[API] Request received');
    
    const body = await req.json();
    console.log('[API] Request body:', JSON.stringify(body));

    if (!body.messages || !Array.isArray(body.messages)) {
      console.error('[API] Invalid request: missing messages array');
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: body.messages,
      stream: true,
    });

    // Create a readable stream for the client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'message_delta') {
              const text = chunk.delta?.text || '';
              controller.enqueue(text);
            }
          }
          controller.close();
        } catch (error) {
          console.error('[API] Stream error:', error);
          controller.error(error);
        }
      },
    });

    // Return the stream with appropriate headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}
