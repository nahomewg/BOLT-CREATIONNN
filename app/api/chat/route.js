// Move this to: app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {  // Changed 'req' to 'request' to match Next.js convention
  try {
    const { messages } = await request.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: messages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API error');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Claude' },
      { status: 500 }
    );
  }
}
