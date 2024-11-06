import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    // Validate environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('API Key exists:', !!apiKey);
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'ANTHROPIC_API_KEY is not configured',
          debug: {
            keyExists: false
          }
        }),
        { status: 500 }
      );
    }

    // Parse the incoming request body
    const body = await request.json();
    console.log('Request body received:', !!body);
    
    if (!body.message) {
      return new Response(
        JSON.stringify({ 
          error: 'Message is required',
          debug: {
            bodyReceived: !!body,
            hasMessage: false
          }
        }),
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log('Attempting Claude request...');
    
    // Create chat completion
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229-v1:0",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: body.message
        }
      ]
    });

    console.log('Claude response received');

    // Return the response
    return new Response(
      JSON.stringify({
        message: completion.content[0].text
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    // Detailed error logging
    const debugInfo = {
        errorType: error.name,
        errorMessage: error.message,
        apiKeyExists: !!process.env.ANTHROPIC_API_KEY,
        apiKeyFirstChars: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.slice(0,4) + '...' : 'none',
        requestReceived: !!body,
        requestMessage: body?.message,
        anthropicError: error.response?.data,
        fullError: error.toString()
    };

    console.error('Debug Info:', debugInfo);

    return new Response(
        JSON.stringify({
            error: 'API Debug Info',
            debug: debugInfo
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
