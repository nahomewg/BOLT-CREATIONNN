import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    // Validate environment variable
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }), 
        { status: 500 }
      );
    }

    // Parse the incoming request body
    const body = await request.json();
    
    if (!body.message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create chat completion
    const completion = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: body.message
        }
      ]
    });

    // Return the response
    return new Response(
      JSON.stringify({ 
        response: completion.content[0].text
      }), 
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
