import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import prisma from '../../../../../lib/prisma';
import jsPDF from 'jspdf';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401 }
      );
    }

    const { id } = params;
    const chat = await prisma.chat.findUnique({
      where: { 
        id,
        userId: session.user.id 
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return new Response(
        JSON.stringify({ error: 'Chat not found' }),
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new jsPDF();
    let yPos = 20;

    // Add title
    doc.setFontSize(16);
    doc.text(chat.title, 105, yPos, { align: 'center' });
    yPos += 20;

    // Add messages
    doc.setFontSize(12);
    chat.messages.forEach(message => {
      // Add sender and timestamp
      doc.setFont('helvetica', 'bold');
      const sender = `${message.role === 'user' ? 'You' : 'Claude'} - ${new Date(message.createdAt).toLocaleString()}`;
      doc.text(sender, 20, yPos);
      yPos += 10;

      // Add message content
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(message.content, 170);
      doc.text(lines, 20, yPos);
      yPos += (lines.length * 7) + 10;

      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="chat-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error exporting chat:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export chat' }),
      { status: 500 }
    );
  }
} 