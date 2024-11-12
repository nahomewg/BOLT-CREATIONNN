import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
        analysis: {
          isNot: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        analysis: true
      }
    });

    return new Response(JSON.stringify(chats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch chats' }),
      { status: 500 }
    );
  }
}

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
        title: 'New Analysis'
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
    console.error('Error creating chat:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create chat' }),
      { status: 500 }
    );
  }
} 