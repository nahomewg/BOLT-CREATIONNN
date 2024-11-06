import { Anthropic } from '@anthropic-ai/sdk';
import {systemPrompt} from '../../config.js'
export async function POST(request) {
  console.log('API route started');
  try {
    // Log env check
    console.log('Checking API key...');
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('No API key found in environment');
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500 }
      );
    }
    console.log('API key exists');

    // Parse request body with logging
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', { message: body.message ? 'exists' : 'missing' });
    
    if (!body.message) {
      console.error('No message in request body');
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400 }
      );
    }

    // Log Anthropic client creation
    console.log('Initializing Anthropic client...');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    console.log('Anthropic client initialized');

    // Log message creation attempt
    console.log('Attempting to create message...');
    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: systemPrompt+ body.message
        }
      ]
    });
    console.log('Message created successfully');

    // Log response creation
    console.log('Preparing response...');
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
    console.error('Detailed error information:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('API response data:', error.response?.data);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        details: error.message,
        fullError: error.response?.data || error.message,
        errorName: error.name,
        errorStack: error.stack
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
