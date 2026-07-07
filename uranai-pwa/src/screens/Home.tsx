import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { GlitchText } from '../components/GlitchText';
import { useProfile } from '../hooks/useProfile';
import { countFortunes, getRecentFortunes } from '../db/queries';
import { Fortune } from '../types';

export function Home() {
  const navigate              = useNavigate();
  const { profile }           = useProfile();
  const [latest, setLatest]   = useState<Fortune | null>(null);
  const [totalCount, setCount] = useState(0);

  useEffect(() => {
    Promise.all([getRecentFortunes(1), countFortunes()]).then(([list, count]) => {
      setLatest(list[0] ?? null);
      setCount(count);
    });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 5)  return 'おやすみなさい';
    if (h < 12) return 'おはようございます';
    if (h < 17) return 'こんにちは';
    return 'こんばんは';
  };

  const lastDate = latest
    ? new Date(latest.savedAt).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })
    : null;

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 80px' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 0',
      }}>
        <GlitchText text="神託" style={{ color: C.cyan, fontSize: 20, fontWeight: 900 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/history')} style={iconBtn}>📜</button>
          <button onClick={() => navigate('/settings')} style={iconBtn}>⚙️</button>
        </div>
      </div>

      {/* Hero area */}
      <div style={{
        padding: '32px 24px 28px', textAlign: 'center',
        borderBottom: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.bgCardAlt} 0%, transparent 100%)`,
        marginTop: 16,
      }}>
        <p style={{ color: C.textDim, fontSize: 13, margin: '0 0 6px', fontFamily: 'monospace' }}>
          {greeting()}、
        </p>
        <h2 style={{ color: C.text, fontSize: 28, margin: '0 0 4px', fontWeight: 700 }}>
          {profile?.name ?? ''}さん
        </h2>
        <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>
          今日も宇宙があなたを導きます
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20 }}>
          <div style={statBox}>
            <div style={{ color: C.cyan, fontSize: 22, fontWeight: 700 }}>{totalCount}</div>
            <div style={{ color: C.textDim, fontSize: 11 }}>占い回数</div>
          </div>
          <div style={statBox}>
            <div style={{ color: C.magenta, fontSize: 14, fontWeight: 700 }}>
              {lastDate ?? '—'}
            </div>
            <div style={{ color: C.textDim, fontSize: 11 }}>最後の占い</div>
          </div>
        </div>
      </div>

      {/* Main actions */}
      <div style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Primary CTA */}
        <button
          onClick={() => navigate('/ask')}
          className="neon-btn"
          style={{ width: '100%', padding: '22px', fontSize: 18, fontFamily: 'monospace', fontWeight: 900 }}
        >
          [ 今すぐ占う ]
        </button>

        {/* Quick question */}
        <button
          onClick={() => navigate('/ask?quick=1')}
          style={{
            width: '100%', padding: '16px',
            background: C.magentaDim,
            border: `1px solid ${C.magenta}`,
            borderRadius: 10, cursor: 'pointer',
            color: C.magenta, fontSize: 15, fontFamily: 'monospace',
            fontWeight: 700, letterSpacing: '0.05em',
            boxShadow: `0 0 12px ${C.magenta}30`,
          }}
        >
          ✨ 質問して占う
        </button>
      </div>

      {/* Latest fortune preview */}
      {latest && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 10 }}>
            // 最近の占い
          </div>
          <div
            onClick={() => navigate(`/reveal/${latest.id}?instant=1`)}
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.textDim, fontSize: 12, fontFamily: 'monospace' }}>{lastDate}</span>
              <span style={{ color: C.magenta, fontSize: 11, fontFamily: 'monospace' }}>
                {latest.question ?? '今日の運勢'}
              </span>
            </div>
            <p style={{
              color: C.text, fontSize: 13, margin: 0, lineHeight: 1.7,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {latest.response}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: C.bgCard, border: `1px solid ${C.border}`,
  borderRadius: 8, width: 40, height: 40,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 18,
};

const statBox: React.CSSProperties = {
  background: C.bgCard, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: '10px 20px', textAlign: 'center',
};
