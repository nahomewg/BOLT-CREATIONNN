import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/authOptions';
import prisma from '../../../lib/prisma';
import { systemPrompt } from '../../config.js';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400 }
      );
    }

    // Store user message
    const userMessage = await prisma.message.create({
      data: {
        content: body.message,
        role: 'user',
        userId: session.user.id,
        chatId: body.chatId
      }
    });

    // Mock response instead of calling Anthropic API
    const mockResponse = "This is a test response to save credits. Your message was: " + body.message;

    // Store assistant response
    const assistantMessage = await prisma.message.create({
      data: {
        content: mockResponse,
        role: 'assistant',
        userId: session.user.id,
        chatId: body.chatId
      }
    });

    return new Response(
      JSON.stringify({
        message: mockResponse
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        details: error.message
      }),
      { status: 500 }
    );
  }
}
