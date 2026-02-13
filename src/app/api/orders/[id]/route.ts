import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                gig: {
                    select: { title: true, image: true }
                },
                buyer: {
                    select: { name: true, image: true }
                },
                seller: {
                    select: { name: true, image: true }
                },
                deliveries: {
                    orderBy: { createdAt: 'desc' }
                },
                revisions: {
                    orderBy: { createdAt: 'desc' }
                },
                activityLogs: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const formattedOrder = {
            ...order,
            gigTitle: order.gig.title,
            gigImage: order.gig.image,
            buyerName: order.buyer.name,
            buyerImage: order.buyer.image,
            sellerName: order.seller.name,
            sellerImage: order.seller.image,
            requirements: order.requirements ? JSON.parse(order.requirements) : [],
            deliveries: order.deliveries.map((d: any) => ({
                ...d,
                files: JSON.parse(d.files || '[]')
            })),
            revisions: order.revisions,
            activityLog: order.activityLogs
        };

        return NextResponse.json(formattedOrder);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PATCH for simple status updates (e.g. Seller accepts order)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 });

        await prisma.$transaction([
            prisma.order.update({
                where: { id },
                data: { status }
            }),
            prisma.activityLog.create({
                data: {
                    orderId: id,
                    type: 'STATUS_CHANGE',
                    message: `Order status updated to ${status}`
                }
            })
        ]);

        return NextResponse.json({ success: true });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
