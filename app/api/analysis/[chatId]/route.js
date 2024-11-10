import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const chatId = params.chatId;
  
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { chatId }
    });
    
    return NextResponse.json(analysis?.data || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const chatId = params.chatId;
  const data = await request.json();
  
  try {
    const analysis = await prisma.analysis.upsert({
      where: { chatId },
      update: { data },
      create: { 
        chatId,
        data
      }
    });
    
    // Update chat title with location
    await prisma.chat.update({
      where: { id: chatId },
      data: { title: data.location || 'Untitled Analysis' }
    });
    
    return NextResponse.json(analysis.data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 