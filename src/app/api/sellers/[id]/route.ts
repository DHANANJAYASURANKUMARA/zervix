import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { calculateSellerLevel } from '@/lib/seller';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Recalculate level on fetch
        try { await calculateSellerLevel(id); } catch { }

        // Get User with aggregate stats
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                soldOrders: {
                    where: { status: 'COMPLETED' },
                    select: { id: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Stats for the seller
        const sellerStats = await prisma.review.aggregate({
            where: {
                gig: {
                    sellerId: id
                }
            },
            _count: true,
            _avg: {
                rating: true
            }
        });

        // Get Gigs
        const gigs = await prisma.gig.findMany({
            where: {
                sellerId: id,
                status: 'ACTIVE'
            },
            include: {
                tiers: {
                    orderBy: { price: 'asc' },
                    take: 1
                },
                reviews: {
                    select: { rating: true }
                }
            }
        });

        const formattedGigs = gigs.map((g: any) => {
            const ratings = g.reviews.map((r: any) => r.rating);
            const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
            return {
                ...g,
                startingPrice: g.tiers[0]?.price || g.price,
                avgRating,
                reviewCount: g.reviews.length
            };
        });

        // Get Reviews (Limit to recent 20)
        const recentReviews = await prisma.review.findMany({
            where: {
                gig: {
                    sellerId: id
                }
            },
            include: {
                user: {
                    select: { name: true, image: true }
                },
                gig: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const formattedReviews = recentReviews.map((r: any) => ({
            ...r,
            userName: r.user.name,
            userImage: r.user.image,
            gigTitle: r.gig.title
        }));

        const parsedUser = {
            ...user,
            skills: user.skills ? JSON.parse(user.skills) : [],
            languages: user.languages ? JSON.parse(user.languages) : [],
            reviewCount: sellerStats._count,
            avgRating: sellerStats._avg.rating || 0
        };

        return NextResponse.json({
            user: parsedUser,
            gigs: formattedGigs,
            reviews: formattedReviews
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
