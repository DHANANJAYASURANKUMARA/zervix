'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Notification { id: string; type: string; title: string; message: string; link: string; isRead: number; createdAt: string; }

export default function Header() {
    const [user, setUser] = useState<{ id: string; name: string; email: string; isSeller?: boolean } | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (stored) setUser(JSON.parse(stored));

        const handleStorage = () => {
            const updated = localStorage.getItem('zervix_user');
            setUser(updated ? JSON.parse(updated) : null);
        };
        window.addEventListener('storage', handleStorage);

        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => { window.removeEventListener('storage', handleStorage); document.removeEventListener('mousedown', handleClick); };
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchNotifs = () => {
            fetch(`/api/notifications?userId=${user.id}`).then(r => r.json()).then(d => {
                setNotifications(d.notifications || []);
                setUnreadCount(d.unreadCount || 0);
            }).catch(() => { });
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 15000);
        return () => clearInterval(interval);
    }, [user]);

    const markAllRead = () => {
        if (!user) return;
        fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
        setUnreadCount(0);
        setNotifications(n => n.map(x => ({ ...x, isRead: 1 })));
    };

    const logout = () => {
        localStorage.removeItem('zervix_user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className="glass" style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '1200px', borderRadius: '20px', padding: '12px 30px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxSizing: 'border-box', zIndex: 1000, border: '1px solid var(--glass-border)'
        }}>
            <Link href="/" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-1px', textDecoration: 'none', color: 'inherit' }}>
                ZER<span className="aurora-text">VIX</span>
            </Link>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontWeight: '500', color: 'var(--text-muted)' }}>
                <Link href="/marketplace" className="nav-link">Explore</Link>
                <Link href="/requests" className="nav-link">Requests</Link>

                {user ? (
                    <div ref={menuRef} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* Favorites */}
                        <a href="/favorites" className="nav-link" title="Favorites" style={{ fontSize: '18px' }}>♥</a>

                        {/* Messages */}
                        <a href="/messages" className="nav-link" title="Messages" style={{ fontSize: '18px' }}>✉</a>

                        {/* Notifications Bell */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false); }} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                fontSize: '18px', position: 'relative', padding: '4px'
                            }}>
                                🔔
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-4px', right: '-6px',
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        background: 'var(--aurora-tertiary)', fontSize: '10px', fontWeight: '800',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>{unreadCount}</span>
                                )}
                            </button>

                            {showNotifs && (
                                <div style={{
                                    position: 'absolute', top: '40px', right: '0', width: '340px',
                                    background: 'var(--bg-accent)', border: '1px solid var(--glass-border)',
                                    borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    overflow: 'hidden', zIndex: 100
                                }}>
                                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '700', fontSize: '15px' }}>Notifications</span>
                                        {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--aurora-primary)', cursor: 'pointer', fontSize: '12px' }}>Mark all read</button>}
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '14px' }}>No notifications</div>
                                        ) : notifications.slice(0, 8).map(n => (
                                            <Link key={n.id} href={n.link || '#'} style={{
                                                display: 'block', padding: '12px 18px', borderBottom: '1px solid var(--glass-border)',
                                                textDecoration: 'none', color: 'inherit',
                                                background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                                            }}>
                                                <div style={{ fontWeight: n.isRead ? '400' : '600', fontSize: '13px', marginBottom: '3px' }}>{n.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{n.message}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Menu */}
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => { setShowMenu(!showMenu); setShowNotifs(false); }} style={{
                                background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '10px',
                                color: 'var(--text-main)'
                            }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--aurora-primary), var(--aurora-secondary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: '800'
                                }}>{(user.name || user.email)[0].toUpperCase()}</div>
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{user.name?.split(' ')[0]}</span>
                            </button>

                            {showMenu && (
                                <div style={{
                                    position: 'absolute', top: '44px', right: '0', width: '220px',
                                    background: 'var(--bg-accent)', border: '1px solid var(--glass-border)',
                                    borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    overflow: 'hidden', zIndex: 100
                                }}>
                                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{user.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{user.email}</div>
                                    </div>
                                    {[
                                        { label: 'Dashboard', href: '/dashboard', icon: '📊' },
                                        { label: 'My Orders', href: '/dashboard', icon: '📦' },
                                        ...(user.isSeller ? [
                                            { label: 'Create Gig', href: '/gigs/create', icon: '✨' },
                                            { label: 'Earnings', href: '/earnings', icon: '💰' },
                                        ] : []),
                                        { label: 'Favorites', href: '/favorites', icon: '💜' },
                                        { label: 'Messages', href: '/messages', icon: '✉️' },
                                        { label: 'Settings', href: '/dashboard', icon: '⚙️' },
                                    ].map(item => (
                                        <Link key={item.label} href={item.href} style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '11px 18px', fontSize: '14px', color: 'var(--text-muted)',
                                            textDecoration: 'none', borderBottom: '1px solid var(--glass-border)',
                                            transition: 'background 0.2s'
                                        }}>
                                            <span>{item.icon}</span> {item.label}
                                        </Link>
                                    ))}
                                    <button onClick={logout} style={{
                                        width: '100%', padding: '12px 18px', background: 'none', border: 'none',
                                        color: '#ef4444', fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}>
                                        <span>🚪</span> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <a href="/auth/login" className="nav-link">Sign In</a>
                        <a href="/auth/signup" className="btn-premium" style={{ fontSize: '14px', padding: '8px 20px', textDecoration: 'none' }}>Join</a>
                    </>
                )}
            </div>
        </nav>
    );
}
