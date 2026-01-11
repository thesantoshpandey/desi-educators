'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { MessageSquare, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Ticket {
    id: string;
    user_id: string;
    name: string | null;
    email: string | null;
    subject: string;
    message: string;
    status: 'Open' | 'Pending' | 'Resolved';
    created_at: string;
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets:', error);
        } else if (data) {
            setTickets(data as Ticket[]);
        }
        setIsLoading(false);
    };

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        // Optimistic update
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus as any } : t));

        const { error } = await supabase
            .from('support_tickets')
            .update({ status: newStatus })
            .eq('id', ticketId);

        if (error) {
            console.error('Error updating status:', error);
            fetchTickets(); // Revert
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return '#ef4444'; // Red
            case 'Pending': return '#eab308'; // Yellow
            case 'Resolved': return '#10b981'; // Green
            default: return '#64748b';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'Open': return '#fee2e2';
            case 'Pending': return '#fef9c3';
            case 'Resolved': return '#dcfce7';
            default: return '#f1f5f9';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Support Tickets</h1>
                <Button variant="outline" size="sm" onClick={fetchTickets} leftIcon={<RefreshCw size={14} />}>
                    Refresh
                </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isLoading ? (
                    <p style={{ color: '#64748b' }}>Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <Card padding="lg" style={{ textAlign: 'center' }}>
                        <p style={{ color: '#64748b' }}>No support tickets found.</p>
                    </Card>
                ) : (
                    tickets.map((ticket) => (
                        <Card key={ticket.id} padding="md">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: getStatusBg(ticket.status),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: getStatusColor(ticket.status),
                                        flexShrink: 0
                                    }}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <h4 style={{ fontWeight: 600 }}>{ticket.subject}</h4>
                                            <span style={{
                                                fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                                                backgroundColor: getStatusBg(ticket.status),
                                                color: getStatusColor(ticket.status)
                                            }}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '8px' }}>
                                            {ticket.message}
                                        </p>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            From: <span style={{ fontWeight: 500, color: '#334155' }}>{ticket.user_id ? (ticket.name || ticket.email || 'User') : 'Guest'}</span> •
                                            {ticket.email && <span style={{ marginLeft: '4px' }}>&lt;{ticket.email}&gt;</span>} •
                                            <span style={{ marginLeft: '4px' }}>{format(new Date(ticket.created_at), 'PPP p')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {ticket.status !== 'Resolved' && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                                            onClick={() => handleUpdateStatus(ticket.id, 'Resolved')}
                                        >
                                            Mark Resolved
                                        </Button>
                                    )}
                                    {ticket.status === 'Open' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(ticket.id, 'Pending')}
                                        >
                                            Mark Pending
                                        </Button>
                                    )}
                                    {ticket.status === 'Resolved' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleUpdateStatus(ticket.id, 'Open')}
                                        >
                                            Re-open
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
