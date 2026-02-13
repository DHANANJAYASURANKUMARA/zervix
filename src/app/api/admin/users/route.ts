import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                sellerLevel: true,
                isSeller: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json({ users });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
