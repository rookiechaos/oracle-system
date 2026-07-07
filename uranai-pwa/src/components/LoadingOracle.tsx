import React, { useEffect, useState } from 'react';
import { C } from '../theme';

const MESSAGES = [
  '星の配置を読んでいます...',
  '宇宙の波動を感じています...',
  'あなたの運命の糸を辿っています...',
  '神託のドアを開いています...',
  '時空の彼方から声が届いています...',
];

export function LoadingOracle() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots]     = useState('');

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length);
    }, 2000);
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => { clearInterval(msgTimer); clearInterval(dotTimer); };
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 32, padding: '48px 24px',
    }}>
      {/* Orbital rings */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${C.cyan}`,
          animation: 'spin 3s linear infinite',
          boxShadow: `0 0 16px ${C.cyan}`,
        }} />
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          border: `2px solid ${C.magenta}`,
          animation: 'spin 2s linear infinite reverse',
          boxShadow: `0 0 12px ${C.magenta}`,
        }} />
        <div style={{
          position: 'absolute', inset: 32, borderRadius: '50%',
          border: `2px solid ${C.green}`,
          animation: 'spin 1.5s linear infinite',
          boxShadow: `0 0 8px ${C.green}`,
        }} />
        <div style={{
          position: 'absolute', inset: 44, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.cyan}40, ${C.magenta}20)`,
          animation: 'pulse-glow 1.5s ease-in-out infinite',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          color: C.cyan, fontSize: 15, letterSpacing: '0.05em',
          margin: 0, minHeight: 24,
          animation: 'fade-up 0.3s ease',
        }}>
          {MESSAGES[msgIdx]}{dots}
        </p>
      </div>
    </div>
  );
}
