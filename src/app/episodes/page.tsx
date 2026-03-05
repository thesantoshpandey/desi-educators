'use client';

import React, { useState } from 'react';
import { EpisodeList } from '@/components/player';
import { Headphones } from 'lucide-react';

const SUBJECTS = [
  { key: null, label: 'All' },
  { key: 'Biology', label: 'Biology' },
  { key: 'Physics', label: 'Physics' },
  { key: 'Chemistry', label: 'Chemistry' },
];

export default function EpisodesPage() {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 16px 120px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}
        >
          <Headphones size={28} style={{ color: '#6366f1' }} />
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 800,
              color: '#e2e8f0',
            }}
          >
            Summit Neuro
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
          Audio episodes by Priya Ma&apos;am. Learn NEET Biology concepts while you commute, cook, or chill.
          Watch 85% of any episode to earn 25 XP.
        </p>
      </div>

      {/* Subject tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
        }}
      >
        {SUBJECTS.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveSubject(s.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor:
                activeSubject === s.key ? '#6366f1' : '#1f2937',
              color:
                activeSubject === s.key ? '#fff' : '#9ca3af',
              transition: 'all 0.2s ease',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Episode List */}
      <EpisodeList
        subject={activeSubject || undefined}
        showTitle={false}
        limit={50}
      />
    </div>
  );
}
