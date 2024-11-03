import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Ensure edge runtime is explicitly set
export const runtime = 'edge';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  console.log('[API] Request received');
  
  try {
    const body = await req.json();
    console.log('[API] Request body parsed:', JSON.stringify(body));

    if (!body.messages || !Array.isArray(body.messages)) {
      console.error('[API] Invalid request: missing messages array');
      return new NextResponse(
        JSON.stringify({ error: 'Invalid request format' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: body.messages,
    });

    console.log('[API] Anthropic response received');

    return new NextResponse(
      JSON.stringify({
        message: response.content[0].text,
        role: 'assistant'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[API] Error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
