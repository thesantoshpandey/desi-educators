import React from 'react';
import { ExamTabs } from '@/components/neet';
import { Card } from '@/components/ui';
import { CalendarRange, BookCheck } from 'lucide-react';

export default function NeetPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Section */}
            <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>NEET Exam Preparation</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Comprehensive study material, mock tests, and doubt clearing sessions for NEET 2026.
                </p>
            </div>

            {/* Quick Stats or Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <Card padding="md" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #DC2626' }}>
                    <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: '#FEF2F2' }}>
                        <CalendarRange size={24} color="#DC2626" />
                    </div>
                    <div>
                        <small style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Neet 2026 Date</small>
                        <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1f2937' }}>May 05, 2026</p>
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>Tentative Schedule</span>
                    </div>
                </Card>
                <Card padding="md" style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #10B981' }}>
                    <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: '#ECFDF5' }}>
                        <BookCheck size={24} color="#10B981" />
                    </div>
                    <div>
                        <small style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Syllabus Status</small>
                        <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1f2937' }}>Updated (NMC)</p>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 500 }}>Latest Pattern</span>
                    </div>
                </Card>
            </div>

            {/* Tabs Section */}
            <ExamTabs />
        </div>
    );
}
