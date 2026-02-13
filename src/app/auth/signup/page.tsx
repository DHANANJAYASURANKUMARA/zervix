'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', username: '', email: '', password: '', isSeller: false });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Signup failed');
                return;
            }

            localStorage.setItem('zervix_user', JSON.stringify(data));
            router.push('/dashboard');
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const update = (key: string, val: string | boolean) => setForm(p => ({ ...p, [key]: val }));

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <form onSubmit={handleSubmit} className="glass-card" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '50px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Join <span className="aurora-text">Zervix</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Start your journey in the premium digital marketplace.</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>{error}</div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Full Name</label>
                            <input type="text" placeholder="John Doe" value={form.name} onChange={(e) => update('name', e.target.value)} required
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px', color: 'white', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Username</label>
                            <input type="text" placeholder="johndoe" value={form.username} onChange={(e) => update('username', e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px', color: 'white', outline: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Email Address</label>
                        <input type="email" placeholder="name@zervix.com" value={form.email} onChange={(e) => update('email', e.target.value)} required
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px', color: 'white', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Password</label>
                        <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => update('password', e.target.value)} required
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px', color: 'white', outline: 'none' }} />
                    </div>

                    {/* Seller Toggle */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px',
                        borderRadius: '12px',
                        background: form.isSeller ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${form.isSeller ? 'var(--aurora-primary)' : 'var(--glass-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }} onClick={() => update('isSeller', !form.isSeller)}>
                        <div style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            background: form.isSeller ? 'var(--aurora-primary)' : 'var(--glass-border)',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: '2px',
                                left: form.isSeller ? '22px' : '2px',
                                transition: 'all 0.3s ease'
                            }} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>I want to sell services</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Enable seller mode to create gigs</div>
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', padding: '15px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Creating Account...' : 'Create Free Account'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-dim)' }}>
                    Already have an account? <Link href="/auth/login" className="aurora-text" style={{ fontWeight: '600' }}>Sign In</Link>
                </div>
            </form>
        </div>
    );
}
