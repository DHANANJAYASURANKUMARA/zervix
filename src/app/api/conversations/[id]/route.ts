import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId'); // Current user ID to mark messages as read

        // Mark messages as read if userId is provided
        if (userId) {
            await prisma.message.updateMany({
                where: {
                    conversationId: id,
                    senderId: { not: userId },
                    isRead: false
                },
                data: {
                    isRead: true
                }
            });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: id
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const formattedMessages = messages.map((m: any) => ({
            ...m,
            senderName: m.sender.name,
            senderImage: m.sender.image
        }));

        return NextResponse.json(formattedMessages);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
