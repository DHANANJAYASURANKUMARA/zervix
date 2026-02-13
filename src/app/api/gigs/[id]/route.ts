import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Fetch gig details with seller, tiers, and reviews in one go
        const gig = await prisma.gig.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        name: true,
                        sellerLevel: true
                    }
                },
                tiers: {
                    orderBy: { price: 'asc' }
                },
                reviews: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });

        // Calculate stats
        const ratings = gig.reviews.map((r: any) => r.rating);
        const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
        const reviewCount = ratings.length;

        // Increment impressions (fire and forget or await depending on preference, here we await for simplicity)
        await prisma.gig.update({
            where: { id },
            data: { impressions: { increment: 1 } }
        });

        const formattedGig = {
            ...gig,
            sellerName: gig.seller.name,
            sellerLevel: gig.seller.sellerLevel,
            tiers: gig.tiers.map((t: any) => ({
                ...t,
                features: typeof t.features === 'string' ? JSON.parse(t.features) : t.features
            })),
            reviews: gig.reviews.map((r: any) => ({
                ...r,
                userName: r.user.name
            })),
            avgRating,
            reviewCount
        };

        return NextResponse.json(formattedGig);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
