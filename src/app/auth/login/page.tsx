'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
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
                maxWidth: '450px',
                padding: '50px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '10px' }}>Welcome <span className="aurora-text">Back</span></h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your dashboard.</p>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@zervix.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                padding: '15px',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '15px',
                                backdropFilter: 'var(--glass-blur)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                padding: '15px',
                                borderRadius: '12px',
                                color: 'white',
                                outline: 'none',
                                fontSize: '15px',
                                backdropFilter: 'var(--glass-blur)'
                            }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-premium"
                    style={{ width: '100%', padding: '15px', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-dim)' }}>
                    Don&apos;t have an account? <Link href="/auth/signup" className="aurora-text" style={{ fontWeight: '600' }}>Create Account</Link>
                </div>
            </form>
        </div>
    );
}
