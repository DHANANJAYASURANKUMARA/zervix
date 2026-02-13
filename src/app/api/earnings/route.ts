import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

        // Calculate Earnings
        // 1. Completed Orders (Net Income = Total * 0.8)
        const completedResult = await prisma.order.aggregate({
            where: {
                sellerId: userId,
                status: 'COMPLETED'
            },
            _sum: {
                total: true
            }
        });

        const totalEarned = (completedResult._sum.total || 0) * 0.8; // 20% platform fee

        // 2. Pending Clearance (Active/Delivered orders)
        const pendingResult = await prisma.order.aggregate({
            where: {
                sellerId: userId,
                status: {
                    in: ['ACTIVE', 'DELIVERED', 'REVISION']
                }
            },
            _sum: {
                total: true
            }
        });

        const pendingClearance = (pendingResult._sum.total || 0) * 0.8;

        return NextResponse.json({
            netIncome: totalEarned,
            withdrawn: 0,
            usedForPurchases: 0,
            pendingClearance: pendingClearance,
            availableForWithdrawal: totalEarned // Simplified
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
