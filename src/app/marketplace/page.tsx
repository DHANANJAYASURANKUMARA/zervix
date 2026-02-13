'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Gig {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    location: string;
    image: string | null;
    sellerName: string;
    avgRating: number | null;
    reviewCount: number;
}

export default function MarketplacePage() {
    const categories = ['All', 'Web Dev', 'Mobile Apps', 'AI/ML', 'Branding', '3D Design', 'Video Edit'];
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchGigs = async (category?: string, searchQuery?: string) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (category && category !== 'All') params.set('category', category);
        if (searchQuery) params.set('search', searchQuery);

        try {
            const res = await fetch(`/api/gigs?${params.toString()}`);
            const data = await res.json();
            setGigs(Array.isArray(data) ? data : []);
        } catch {
            setGigs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGigs(); }, []);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        fetchGigs(cat, search);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchGigs(activeCategory, search);
    };

    return (
        <div style={{ width: '90%', maxWidth: '1400px', margin: '0 auto', padding: '40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Market<span className="aurora-text">place</span></h1>
                    <p style={{ color: 'var(--text-muted)' }}>Discover world-class digital experts and premium services.</p>
                </div>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search gigs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--glass-border)',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            color: 'white',
                            outline: 'none',
                            width: '250px'
                        }}
                    />
                    <button type="submit" className="btn-premium" style={{ padding: '10px 20px', fontSize: '14px' }}>Search</button>
                </form>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '50px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                {categories.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => handleCategoryChange(cat)}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '100px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                            background: activeCategory === cat ? 'var(--aurora-primary)' : 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            backdropFilter: 'var(--glass-blur)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>⏳</div>
                    Loading premium gigs...
                </div>
            )}

            {/* Empty State */}
            {!loading && gigs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
                    <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No gigs found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Try a different search or <Link href="/api/seed" style={{ color: 'var(--aurora-primary)' }}>seed demo data</Link>.</p>
                </div>
            )}

            {/* Gigs Grid */}
            {!loading && gigs.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {gigs.map((gig) => (
                        <Link key={gig.id} href={`/gigs/${gig.id}`} className="glass-card" style={{
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            textDecoration: 'none',
                            color: 'inherit'
                        }}>
                            <div style={{
                                height: '200px',
                                background: `linear-gradient(135deg, var(--bg-accent), var(--aurora-primary)22)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                color: 'var(--text-dim)',
                                borderBottom: '1px solid var(--glass-border)'
                            }}>
                                {gig.category}
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--aurora-primary)', opacity: 0.5 }} />
                                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{gig.sellerName}</div>
                                    {gig.location && (
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>📍 {gig.location.split(',')[0]}</div>
                                    )}
                                </div>

                                <h3 style={{ fontSize: '18px', lineHeight: '1.4', marginBottom: '15px', height: '50px', overflow: 'hidden' }}>{gig.title}</h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
                                    <span style={{ color: '#fbbf24' }}>★</span>
                                    <span style={{ fontWeight: '700' }}>{gig.avgRating ? gig.avgRating.toFixed(1) : 'New'}</span>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>({gig.reviewCount})</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500' }}>STARTING AT</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
