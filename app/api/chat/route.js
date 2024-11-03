import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = body.messages || [];

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('API key not configured');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    console.log('Sending messages to Claude:', messages); // Debug log

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
      return NextResponse.json({ error: 'API response error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
