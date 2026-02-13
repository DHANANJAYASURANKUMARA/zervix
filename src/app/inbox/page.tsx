'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Message { id: string; senderId: string; content: string; createdAt: string; isRead: boolean; senderName?: string; senderImage?: string; }
interface Conversation {
    id: string;
    otherUserId: string; otherUserName: string; otherUserImage: string;
    lastMessage: string; lastMessageAt: string; unreadCount: number;
}

import { Suspense } from 'react';

function InboxContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userId, setUserId] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem('zervix_user');
        if (!stored) { router.push('/auth/login'); return; }
        const uId = JSON.parse(stored).id;
        setUserId(uId);
        fetchConversations(uId);

        // Handle URL param for direct linking
        const convParam = searchParams.get('id');
        if (convParam) setActiveConvId(convParam);
    }, [router, searchParams]);

    // Fetch Messages when active conversation changes
    useEffect(() => {
        if (activeConvId && userId) {
            fetchMessages(activeConvId);
            // Poll for new messages every 3s
            pollInterval.current = setInterval(() => fetchMessages(activeConvId, true), 3000);
        } else {
            setMessages([]);
            if (pollInterval.current) clearInterval(pollInterval.current);
        }
        return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
    }, [activeConvId, userId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = (uId: string) => {
        fetch(`/api/conversations?userId=${uId}`).then(r => r.json()).then(data => {
            if (!data.error) setConversations(data);
        });
    };

    const fetchMessages = (convId: string, background = false) => {
        fetch(`/api/conversations/${convId}?userId=${userId}`).then(r => r.json()).then(data => {
            if (!data.error) {
                setMessages(data);
                if (!background) fetchConversations(userId); // Refresh list to clear unread
            }
        });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvId || !userId) return;
        setSending(true);
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: activeConvId, senderId: userId, content: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages(activeConvId, true); // Immediate refresh
                fetchConversations(userId); // Update list preview
            }
        } finally { setSending(false); }
    };

    const handleSelectConversation = (id: string) => {
        setActiveConvId(id);
        router.push(`/inbox?id=${id}`, { scroll: false });
    };

    if (!userId) return null;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', maxWidth: '1400px', margin: '0 auto', background: 'var(--bg-main)' }}>

            {/* Sidebar List */}
            <div style={{
                width: '350px', borderRight: '1px solid var(--glass-border)', display: activeConvId ? 'none' : 'block'
            }} className="desktop-show">
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '700' }}>Inbox</h1>
                </div>
                <div style={{ overflowY: 'auto', height: 'calc(100% - 70px)' }}>
                    {conversations.length === 0 ? (
                        <div style={{ padding: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>No conversations yet.</div>
                    ) : conversations.map(c => (
                        <div key={c.id} onClick={() => handleSelectConversation(c.id)} style={{
                            padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)',
                            background: activeConvId === c.id ? 'var(--glass-highlight)' : 'transparent',
                            display: 'flex', gap: '15px', alignItems: 'center'
                        }} className="hover:bg-white/5">
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%', background: 'var(--glass-highlight)',
                                    backgroundImage: c.otherUserImage ? `url(${c.otherUserImage})` : 'none', backgroundSize: 'cover',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                                }}>
                                    {!c.otherUserImage && c.otherUserName[0]}
                                </div>
                                {c.unreadCount > 0 && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', background: 'var(--aurora-primary)', borderRadius: '50%', border: '2px solid var(--bg-main)' }} />
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: c.unreadCount > 0 ? '700' : '600', color: 'var(--text-main)' }}>{c.otherUserName}</span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{new Date(c.lastMessageAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{
                                    fontSize: '13px', color: c.unreadCount > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: c.unreadCount > 0 ? '600' : '400'
                                }}>
                                    {c.unreadCount > 0 ? `(${c.unreadCount}) ` : ''}{c.lastMessage}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: activeConvId ? 'flex' : 'none', flexDirection: 'column' }} className="desktop-flex">
                {activeConvId ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '15px 25px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <button onClick={() => { setActiveConvId(null); router.push('/inbox'); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', marginRight: '10px' }} className="mobile-only">
                                ←
                            </button>
                            {conversations.find(c => c.id === activeConvId) && (
                                <>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {conversations.find(c => c.id === activeConvId)?.otherUserName[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700' }}>{conversations.find(c => c.id === activeConvId)?.otherUserName}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Online</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map(m => {
                                // Simple Offer Parsing
                                const isOffer = m.content.startsWith('OFFER:');
                                let offerData = null;
                                if (isOffer) {
                                    try {
                                        // Content format: "OFFER:{"id":"...","price":100,...}"
                                        offerData = JSON.parse(m.content.substring(6));
                                    } catch { }
                                }

                                return (
                                    <div key={m.id} style={{
                                        alignSelf: m.senderId === userId ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                    }}>
                                        <div style={{
                                            padding: '12px 18px', borderRadius: '18px',
                                            background: m.senderId === userId ? 'var(--aurora-primary)' : 'var(--glass-highlight)',
                                            color: 'white', borderBottomRightRadius: m.senderId === userId ? '4px' : '18px', borderBottomLeftRadius: m.senderId === userId ? '18px' : '4px'
                                        }}>
                                            {isOffer && offerData ? (
                                                <div style={{ minWidth: '200px' }}>
                                                    <div style={{ fontWeight: '700', marginBottom: '5px', fontSize: '12px', opacity: 0.8, letterSpacing: '1px' }}>CUSTOM OFFER</div>
                                                    <div style={{ fontSize: '15px', marginBottom: '15px', lineHeight: '1.4' }}>{offerData.message}</div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '11px', opacity: 0.7 }}>Price</div>
                                                            <div style={{ fontWeight: '700' }}>${offerData.price}</div>
                                                        </div>
                                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '11px', opacity: 0.7 }}>Delivery</div>
                                                            <div style={{ fontWeight: '700' }}>{offerData.delivery}d</div>
                                                        </div>
                                                    </div>

                                                    {m.senderId !== userId && (
                                                        <button
                                                            onClick={() => alert(`Redirecting to checkout for Offer ${offerData.id} ($${offerData.price})`)} // Mock checkout redirect
                                                            className="btn-primary"
                                                            style={{ width: '100%', padding: '10px', fontSize: '13px', background: 'var(--aurora-cyan)', color: 'var(--bg-deep)', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                                        >
                                                            Accept Offer
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', textAlign: m.senderId === userId ? 'right' : 'left' }}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, padding: '14px', borderRadius: '100px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', paddingLeft: '20px' }}
                                />
                                <button type="submit" disabled={sending} className="btn-primary" style={{ borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                                    ➤
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column' }} className="desktop-flex">
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>💬</div>
                        <div>Select a conversation to start chatting</div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @media (min-width: 768px) {
                    .mobile-only { display: none !important; }
                    .desktop-show { display: block !important; }
                    .desktop-flex { display: flex !important; }
                }
                @media (max-width: 767px) {
                    .desktop-show { display: ${activeConvId ? 'none' : 'block'} !important; }
                    .desktop-flex { display: ${activeConvId ? 'flex' : 'none'} !important; }
                }
            `}</style>
        </div>
    );
}

export default function InboxPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Inbox...</div>}>
            <InboxContent />
        </Suspense>
    );
}
