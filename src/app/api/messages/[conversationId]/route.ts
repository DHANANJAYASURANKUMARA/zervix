import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const { conversationId } = await params;
        const userId = request.nextUrl.searchParams.get('userId');

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        // Mark messages as read
        if (userId) {
            await prisma.message.updateMany({
                where: {
                    conversationId,
                    senderId: { not: userId },
                    isRead: false
                },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ messages });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
    try {
        const { conversationId } = await params;
        const { senderId, content } = await request.json();
        if (!senderId || !content) return NextResponse.json({ error: 'senderId and content required' }, { status: 400 });

        const result = await prisma.$transaction([
            prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content
                }
            }),
            prisma.conversation.update({
                where: { id: conversationId },
                data: {
                    lastMessage: content,
                    lastMessageAt: new Date()
                }
            })
        ]);

        return NextResponse.json({ id: result[0].id });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
