import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/authOptions';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: 'New Chat',
      }
    });

    return new Response(
      JSON.stringify(chat),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create chat' }),
      { status: 500 }
    );
  }
} 