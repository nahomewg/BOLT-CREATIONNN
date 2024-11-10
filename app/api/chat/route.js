import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/authOptions';
import prisma from '../../../lib/prisma';
import { systemPrompt } from '../../config.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    await prisma.message.create({
      data: {
        content: body.message,
        role: 'user',
        userId: session.user.id,
        chatId: body.chatId
      }
    });

    // Call Claude API with structured prompt
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: body.message
      }]
    });

    const assistantResponse = response.content[0].text;

    // Store assistant response
    await prisma.message.create({
      data: {
        content: assistantResponse,
        role: 'assistant',
        userId: session.user.id,
        chatId: body.chatId
      }
    });

    return new Response(
      JSON.stringify({ message: assistantResponse }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
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
