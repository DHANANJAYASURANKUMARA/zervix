import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
    try {
        const password = await bcrypt.hash('demo123', 10);

        // Delete existing data to start fresh (Optional, but good for seeding)
        // await prisma.notification.deleteMany();
        // await prisma.message.deleteMany();
        // await prisma.conversation.deleteMany();
        // await prisma.review.deleteMany();
        // await prisma.gigTier.deleteMany();
        // await prisma.gig.deleteMany();
        // await prisma.user.deleteMany();

        // Create demo sellers
        const sellersData = [
            { name: 'Alex Chen', email: 'alex@zervix.com', bio: 'Senior Fullstack Developer with 8+ years of experience building SaaS platforms, AI integrations, and scalable architectures. Specialized in Next.js, React, and cloud infrastructure.', skills: JSON.stringify(['Next.js', 'React', 'Node.js', 'AI/ML', 'AWS']), languages: JSON.stringify(['English', 'Mandarin']), country: 'United States', sellerLevel: 'TOP_RATED' },
            { name: 'Sarah Johnson', email: 'sarah@zervix.com', bio: 'Award-winning brand designer crafting premium visual identities for startups and enterprises. 3D design specialist with a passion for creating immersive brand experiences.', skills: JSON.stringify(['Branding', '3D Design', 'Logo Design', 'UI/UX']), languages: JSON.stringify(['English', 'French']), country: 'United Kingdom', sellerLevel: 'LEVEL_2' },
            { name: 'DevFlow Studio', email: 'devflow@zervix.com', bio: 'A team of 5 fullstack developers delivering enterprise-grade e-commerce solutions. We build everything from payment integrations to inventory systems.', skills: JSON.stringify(['E-commerce', 'Shopify', 'React', 'Python', 'PostgreSQL']), languages: JSON.stringify(['English', 'Spanish']), country: 'Canada', sellerLevel: 'TOP_RATED' },
            { name: 'NeuralLabs AI', email: 'neural@zervix.com', bio: 'AI research lab turned freelance studio. We fine-tune LLMs, build custom AI pipelines, and create intelligent automation for businesses of all sizes.', skills: JSON.stringify(['GPT', 'LLM Fine-tuning', 'Python', 'TensorFlow', 'Computer Vision']), languages: JSON.stringify(['English', 'German']), country: 'Germany', sellerLevel: 'LEVEL_2' },
            { name: 'Visio Media', email: 'visio@zervix.com', bio: 'Cinematic motion graphics and 3D visualization studio. Creating showreels, product renders, and branded video content that captivates audiences.', skills: JSON.stringify(['After Effects', 'Cinema 4D', 'Blender', 'Video Editing']), languages: JSON.stringify(['English', 'Hindi']), country: 'India', sellerLevel: 'LEVEL_1' },
            { name: 'CloudMaster', email: 'cloud@zervix.com', bio: 'DevOps engineer and cloud architect with expertise in Kubernetes, CI/CD, and infrastructure automation. Making your deployments bulletproof.', skills: JSON.stringify(['AWS', 'GCP', 'Kubernetes', 'Docker', 'Terraform']), languages: JSON.stringify(['English']), country: 'Australia', sellerLevel: 'LEVEL_2' },
        ];

        const sellers = await Promise.all(sellersData.map(s =>
            prisma.user.upsert({
                where: { email: s.email },
                update: {},
                create: { ...s, password, isSeller: true, role: 'SELLER' }
            })
        ));

        // Create demo buyers
        const buyersData = [
            { name: 'Demo Buyer', email: 'buyer@zervix.com' },
            { name: 'Jane Smith', email: 'jane@zervix.com' },
            { name: 'Mark Taylor', email: 'mark@zervix.com' },
        ];

        const buyers = await Promise.all(buyersData.map(b =>
            prisma.user.upsert({
                where: { email: b.email },
                update: {},
                create: { ...b, password, isSeller: false, role: 'BUYER', country: 'United States' }
            })
        ));

        // Gig definitions
        const gigsData = [
            { title: 'Bespoke Next.js SaaS Architecture', description: 'I will architect and develop a premium, production-ready SaaS platform using Next.js 14, Prisma, and modern AI integrations. Includes custom design system, auth flows, and scalable backend.', category: 'Web Development', tags: JSON.stringify(['Next.js', 'SaaS', 'React', 'Prisma', 'AI']), price: 950, sellerIndex: 0 },
            { title: 'Premium 3D Brand Identity System', description: 'Complete brand identity package including 3D logo, style guide, business cards, and social media kit with iridescent effects. Stand out from the crowd with a truly unique visual identity.', category: 'Graphic Design', tags: JSON.stringify(['Branding', '3D Logo', 'Identity', 'Style Guide']), price: 1200, sellerIndex: 1 },
            { title: 'Fullstack E-commerce Engine', description: 'Complete e-commerce solution with payment processing (Stripe), inventory management, analytics dashboard, and admin panel. Ready to launch and scale.', category: 'Web Development', tags: JSON.stringify(['E-commerce', 'Stripe', 'React', 'Node.js', 'MongoDB']), price: 1500, sellerIndex: 2 },
            { title: 'AI-Powered Content Platform', description: 'Custom AI content generation platform with GPT integration, content scheduling, and multi-channel publishing. Automate your content workflow end-to-end.', category: 'AI Services', tags: JSON.stringify(['AI', 'GPT', 'Content', 'Automation', 'Python']), price: 2200, sellerIndex: 3 },
        ];

        for (const gd of gigsData) {
            const seller = sellers[gd.sellerIndex];
            const gig = await prisma.gig.create({
                data: {
                    title: gd.title,
                    description: gd.description,
                    category: gd.category,
                    tags: gd.tags,
                    price: gd.price,
                    sellerId: seller.id,
                    status: 'ACTIVE',
                    tiers: {
                        create: [
                            { name: 'Basic', title: 'Starter', description: 'Essential core features.', price: gd.price, delivery: 5, revisions: 1, features: JSON.stringify(['Core Features', 'Doc']) },
                            { name: 'Standard', title: 'Pro', description: 'Advanced professional features.', price: Math.round(gd.price * 1.8), delivery: 10, revisions: 3, features: JSON.stringify(['Pro Features', 'Priority Support']) },
                            { name: 'Premium', title: 'Enterprise', description: 'Full enterprise solution.', price: Math.round(gd.price * 3.2), delivery: 21, revisions: -1, features: JSON.stringify(['Enterprise Scale', '30-Day Support']) }
                        ]
                    }
                }
            });

            // Add reviews
            const reviewComments = ['Great!', 'Excellent.', 'Very good.', 'Recommended.'];
            for (let i = 0; i < 3; i++) {
                const buyer = buyers[i % buyers.length];
                await prisma.review.create({
                    data: {
                        rating: 5,
                        communicationRating: 5,
                        serviceRating: 5,
                        recommendRating: 5,
                        comment: reviewComments[i % reviewComments.length],
                        userId: buyer.id,
                        gigId: gig.id
                    }
                });
            }
        }

        // Create some orders
        await prisma.order.create({
            data: {
                status: 'COMPLETED',
                total: 950,
                tierName: 'Basic',
                buyerId: buyers[0].id,
                sellerId: sellers[0].id,
                gigId: (await prisma.gig.findFirst({ where: { sellerId: sellers[0].id } }))!.id,
                completedAt: new Date()
            }
        });

        // Create a conversation
        await prisma.conversation.create({
            data: {
                user1Id: buyers[0].id,
                user2Id: sellers[0].id,
                lastMessage: 'Looking forward to it!',
                lastMessageAt: new Date(),
                messages: {
                    create: [
                        { senderId: buyers[0].id, content: 'Hi, I need a SaaS platform.', isRead: true },
                        { senderId: sellers[0].id, content: 'Sure, I can help!', isRead: true }
                    ]
                }
            }
        });

        // Create a buyer request
        await prisma.buyerRequest.create({
            data: {
                buyerId: buyers[1].id,
                title: 'CRM Dashboard',
                description: 'Need a custom CRM with Next.js',
                category: 'Web Development',
                budget: 3000,
                deliveryDays: 14,
                status: 'OPEN'
            }
        });

        return NextResponse.json({
            message: 'Database seeded successfully with Prisma!',
            data: { sellers: sellers.length, buyers: buyers.length, orders: 1 }
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
