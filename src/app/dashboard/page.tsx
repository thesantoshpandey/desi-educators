'use client';

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface StreakData { current_streak: number; longest_streak: number; total_xp: number; last_activity_date: string; }
interface LeaderboardEntry { user_id: string; weekly_xp: number; rank: number; name: string; }
interface Badge { id: string; name: string; icon_url: string; description: string; earned: boolean; }

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [streak, setStreak] = useState<StreakData>({ current_streak: 0, longest_streak: 0, total_xp: 0, last_activity_date: '' });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [stats, setStats] = useState({ accuracy: 0, testsTaken: 0 });

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    // Streak
    try {
      const r = await fetch('/api/gamification/streak');
      const d = await r.json();
      if (d.streak) setStreak(d.streak);
      if (d.streak?.last_activity_date === new Date().toISOString().split('T')[0]) setDailyClaimed(true);
    } catch {}

    // Leaderboard
    try {
      const r = await fetch('/api/gamification/leaderboard');
      const d = await r.json();
      if (d.leaderboard) setLeaderboard(d.leaderboard.slice(0, 10));
      if (d.userRank) setUserRank(d.userRank);
    } catch {}

    // Badges
    try {
      const r = await fetch('/api/gamification/badges');
      const d = await r.json();
      if (d.badges) setBadges(d.badges);
    } catch {}

    // Quiz attempts
    try {
      if (!user) return;
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (attempts && attempts.length > 0) {
        const quizIds = [...new Set(attempts.map((a: any) => a.quiz_id))];
        const { data: quizData } = await supabase.from('quizzes').select('id, title').in('id', quizIds);
        const qm = (quizData || []).reduce((a: any, q: any) => { a[q.id] = q.title; return a; }, {});
        const enriched = attempts.map((a: any) => ({ ...a, quizTitle: qm[a.quiz_id] || 'Quiz' }));
        setRecentAttempts(enriched);

        let tc = 0, tq = 0;
        enriched.forEach((a: any) => { tc += a.correct_count || 0; tq += (a.total_marks || 0) / 4; });
        setStats({ accuracy: tq > 0 ? Math.round((tc / tq) * 100) : 0, testsTaken: enriched.length });
      }
    } catch {}
  };

  const claimDaily = async () => {
    try {
      const r = await fetch('/api/gamification/daily-login', { method: 'POST' });
      if (r.ok) {
        setDailyClaimed(true);
        fetchAll();
      }
    } catch {}
  };

  // Streak calendar: last 28 days
  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        isToday: i === 0,
        isActive: false, // We'd need activity data per day; for now mark recent streak days
      });
    }
    // Mark streak days as active
    if (streak.current_streak > 0) {
      const end = days.length - 1;
      for (let i = 0; i < Math.min(streak.current_streak, 28); i++) {
        if (days[end - i]) days[end - i].isActive = true;
      }
    }
    return days;
  };

  const xpLevel = Math.floor(streak.total_xp / 500);
  const xpInLevel = streak.total_xp % 500;
  const xpPct = Math.min((xpInLevel / 500) * 100, 100);

  const badgeEmojis: Record<string, string> = {
    first_login: '👋', streak_3: '🔥', streak_7: '💪', streak_14: '⚡', streak_30: '🏆',
    xp_100: '⭐', xp_500: '🌟', xp_1000: '💫', xp_5000: '🚀',
    quiz_1: '📝', quiz_10: '🎯', quiz_50: '🏅',
    perfect_quiz: '💯', bio_master: '🧬', physics_master: '⚛️', chem_master: '🧪',
    episode_1: '🎧', episode_10: '🎵', episode_25: '📻',
    early_bird: '🌅',
  };

  if (isLoading || !user) return <div className={styles.loading}>Loading...</div>;

  const calendar = getCalendarDays();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1>Hey, {user.name} 👋</h1>
        <p>Keep the momentum going. Every day counts.</p>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239,68,68,0.1)' }}>🔥</div>
          <div>
            <div className={styles.statValue}>{streak.current_streak}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(251,191,36,0.1)' }}>⚡</div>
          <div>
            <div className={styles.statValue}>{streak.total_xp.toLocaleString()}</div>
            <div className={styles.statLabel}>Total XP</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34,197,94,0.1)' }}>🎯</div>
          <div>
            <div className={styles.statValue}>{stats.accuracy}%</div>
            <div className={styles.statLabel}>Accuracy</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.1)' }}>📊</div>
          <div>
            <div className={styles.statValue}>#{userRank || '--'}</div>
            <div className={styles.statLabel}>Weekly Rank</div>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Daily login */}
          <div className={styles.card}>
            <button className={styles.dailyBtn} onClick={claimDaily} disabled={dailyClaimed}>
              {dailyClaimed ? '✅ Daily XP Claimed' : '🎁 Claim +5 XP Daily Login'}
            </button>
          </div>

          {/* Streak calendar */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>🔥 Streak Calendar</div>
            <div className={styles.calLabels}>
              {dayLabels.map((d, i) => <div key={i} className={styles.calLabel}>{d}</div>)}
            </div>
            <div className={styles.calGrid}>
              {calendar.map((d, i) => (
                <div
                  key={i}
                  className={styles.calDay}
                  data-active={d.isActive ? 'true' : undefined}
                  data-today={d.isToday ? 'true' : undefined}
                  title={d.date}
                />
              ))}
            </div>
            <div style={{ marginTop: '12px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Current: {streak.current_streak} days</span>
              <span>Longest: {streak.longest_streak} days</span>
            </div>
          </div>

          {/* XP Level */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>⚡ Level {xpLevel}</div>
            <div className={styles.xpBar}>
              <div className={styles.xpFill} style={{ width: `${xpPct}%` }} />
            </div>
            <div className={styles.xpText}>
              <span>{xpInLevel} / 500 XP</span>
              <span>Next: Level {xpLevel + 1}</span>
            </div>
          </div>

          {/* Recent quizzes */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>📝 Recent Activity</div>
            {recentAttempts.length === 0 ? (
              <div className={styles.empty}>
                <p>No quizzes taken yet. Start your first one!</p>
                <Link href="/neet"><button className={styles.emptyBtn}>Browse Subjects</button></Link>
              </div>
            ) : (
              <div className={styles.continueList}>
                {recentAttempts.map((a, i) => (
                  <Link key={i} href={`/quiz/result/${a.id}`}>
                    <div className={styles.continueItem}>
                      <div className={styles.subjectDot} style={{
                        background: a.percentage >= 80 ? '#22c55e' : a.percentage >= 50 ? '#f59e0b' : '#ef4444'
                      }} />
                      <div className={styles.continueInfo}>
                        <div className={styles.continueTitle}>{a.quizTitle}</div>
                        <div className={styles.continueSub}>{Math.round(a.percentage)}% &middot; {new Date(a.completed_at).toLocaleDateString()}</div>
                      </div>
                      <span className={styles.continueArrow}>&rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>🏅 Badges ({badges.filter(b => b.earned).length}/{badges.length})</div>
            <div className={styles.badgeGrid}>
              {badges.slice(0, 12).map((b, i) => (
                <div key={i} className={styles.badge} title={b.description}>
                  <div className={`${styles.badgeIcon} ${b.earned ? styles.badgeEarned : styles.badgeLocked}`}>
                    {badgeEmojis[b.icon_url] || '🏅'}
                  </div>
                  <span className={styles.badgeName}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Continue learning */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>📚 Continue Learning</div>
            <div className={styles.continueList}>
              {[
                { title: 'Cell Biology', sub: 'Chapter 8: Cell Division', color: '#22c55e', href: '/neet' },
                { title: 'Physics', sub: 'Thermodynamics', color: '#3b82f6', href: '/neet/physics' },
                { title: 'Chemistry', sub: 'Organic Reactions', color: '#f59e0b', href: '/neet/chemistry' },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className={styles.continueItem}>
                    <div className={styles.subjectDot} style={{ background: item.color }} />
                    <div className={styles.continueInfo}>
                      <div className={styles.continueTitle}>{item.title}</div>
                      <div className={styles.continueSub}>{item.sub}</div>
                    </div>
                    <span className={styles.continueArrow}>&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>🏆 Weekly Leaderboard</div>
            {leaderboard.length === 0 ? (
              <div className={styles.empty}>
                <p>Earn XP to appear on the leaderboard!</p>
              </div>
            ) : (
              <div>
                {leaderboard.map((entry, i) => (
                  <div key={i} className={`${styles.lbRow} ${entry.user_id === user?.id ? styles.lbYou : ''}`}>
                    <div className={styles.lbRank} data-top={String(i + 1)}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>
                    <div className={styles.lbName}>
                      {entry.name || 'Student'}
                      {entry.user_id === user?.id && <span style={{ color: 'var(--primary)', fontSize: '11px', marginLeft: '6px' }}>(you)</span>}
                    </div>
                    <div className={styles.lbXp}>{entry.weekly_xp} XP</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>⚡ Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/episodes">
                <div className={styles.continueItem}>
                  <span>🎧</span>
                  <div className={styles.continueInfo}>
                    <div className={styles.continueTitle}>Listen to Episodes</div>
                    <div className={styles.continueSub}>+25 XP per episode</div>
                  </div>
                  <span className={styles.continueArrow}>&rarr;</span>
                </div>
              </Link>
              <Link href="/neet">
                <div className={styles.continueItem}>
                  <span>📝</span>
                  <div className={styles.continueInfo}>
                    <div className={styles.continueTitle}>Take a Quiz</div>
                    <div className={styles.continueSub}>+10 XP per correct answer</div>
                  </div>
                  <span className={styles.continueArrow}>&rarr;</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
