// app/api/chat/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Add this line

export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Anthropic API error', details: error },
        { status: response.status }
      );
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
