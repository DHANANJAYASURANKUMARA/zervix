import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const [usersCount, gigsCount, ordersCount, totalRevenueResult] = await Promise.all([
            prisma.user.count(),
            prisma.gig.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { total: true }
            })
        ]);

        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                buyer: {
                    select: { name: true }
                }
            }
        });

        const formattedOrders = recentOrders.map((o: any) => ({
            id: o.id,
            total: o.total,
            status: o.status,
            createdAt: o.createdAt,
            buyerName: o.buyer.name
        }));

        return NextResponse.json({
            users: usersCount,
            gigs: gigsCount,
            orders: ordersCount,
            revenue: totalRevenueResult._sum.total || 0,
            recentOrders: formattedOrders
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
