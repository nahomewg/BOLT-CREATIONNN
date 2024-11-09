import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/authOptions';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: 'Chat ID is required' }),
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        userId: session.user.id,
        chatId: chatId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch messages' }),
      { status: 500 }
    );
  }
} 