import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import prisma from '../../../../lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const { title } = await request.json();
    const { id } = params;

    const chat = await prisma.chat.update({
      where: {
        id,
        userId: session.user.id
      },
      data: { title }
    });

    return new Response(JSON.stringify(chat), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update chat' }),
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const { id } = params;

    await prisma.chat.delete({
      where: {
        id,
        userId: session.user.id
      }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete chat' }),
      { status: 500 }
    );
  }
} 