'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    isSeller: boolean;
    role: string;
}

interface Order {
    id: string;
    status: string;
    total: number;
    gigTitle: string;
    category: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [view, setView] = useState<'buyer' | 'seller'>('buyer');

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) {
            router.push('/auth/login');
            return;
        }
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setView(parsed.isSeller ? 'seller' : 'buyer');

        // Fetch orders
        fetch(`/api/orders?userId=${parsed.id}`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setOrders(data); })
            .catch(() => { });
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('zervix_user');
        router.push('/');
    };

    if (!user) return null;

    const stats = [
        { label: 'Active Orders', value: orders.filter(o => o.status === 'PENDING').length.toString(), icon: '📦' },
        { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length.toString(), icon: '✅' },
        { label: 'Total Spent', value: `$${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: '💰' },
        { label: 'All Orders', value: orders.length.toString(), icon: '📊' },
    ];

    return (
        <div style={{ width: '90%', maxWidth: '1400px', margin: '0 auto', padding: '40px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800' }}>
                        {view === 'seller' ? 'Seller' : 'User'} <span className="aurora-text">Dashboard</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name || user.email}.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {user.isSeller && (
                        <button
                            onClick={() => setView(v => v === 'buyer' ? 'seller' : 'buyer')}
                            className="btn-glass"
                            style={{ padding: '8px 20px', fontSize: '14px' }}
                        >
                            Switch to {view === 'buyer' ? 'Seller' : 'Buyer'} View
                        </button>
                    )}
                    <button onClick={handleLogout} className="btn-glass" style={{ padding: '8px 20px', fontSize: '14px', color: '#ef4444' }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                        <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: '800' }}>{stat.value}</div>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bento Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                {/* Orders List */}
                <div className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '20px' }}>Recent Orders</h3>
                        <Link href="/marketplace" className="btn-premium" style={{ fontSize: '13px', padding: '8px 20px', textDecoration: 'none' }}>Browse Gigs</Link>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
                            No orders yet. <Link href="/marketplace" style={{ color: 'var(--aurora-primary)' }}>Explore the marketplace</Link>.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {orders.map((order) => (
                                <div key={order.id} style={{
                                    display: 'flex',
                                    gap: '15px',
                                    alignItems: 'center',
                                    padding: '15px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--aurora-primary)', opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                        {order.category === 'Web Dev' ? '💻' : order.category === 'AI/ML' ? '🤖' : '🎨'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600' }}>{order.gigTitle}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: order.status === 'PENDING' ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)',
                                                color: order.status === 'PENDING' ? '#fbbf24' : '#34d399',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>{order.status}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: '700' }}>${order.total}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))',
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: '800',
                            color: 'white'
                        }}>
                            {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>{user.name || 'User'}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '15px' }}>{user.email}</p>
                        <div style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '100px',
                            background: user.isSeller ? 'rgba(99,102,241,0.15)' : 'rgba(52,211,153,0.15)',
                            color: user.isSeller ? 'var(--aurora-primary)' : '#34d399',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {user.role}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/marketplace" className="btn-glass" style={{ textAlign: 'center', textDecoration: 'none', padding: '12px' }}>Browse Marketplace</Link>
                            {user.isSeller && (
                                <Link href="/gigs/create" className="btn-premium" style={{ textAlign: 'center', textDecoration: 'none', padding: '12px' }}>Create New Gig</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
