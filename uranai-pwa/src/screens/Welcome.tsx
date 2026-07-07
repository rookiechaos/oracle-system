import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { GlitchText } from '../components/GlitchText';

export function Welcome() {
  const navigate  = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Matrix rain effect (resizes with window)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const chars = '占運命星月愛金財健仕事恋縁幸凶吉大小01';
    let drops: number[] = [];
    let intervalId: ReturnType<typeof setInterval>;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.max(1, Math.floor(canvas.width / 18));
      drops = Array(cols).fill(1);
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(5,0,16,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `${C.cyan}60`;
      ctx.font      = '14px monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 18, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    resize();
    intervalId = setInterval(draw, 55);
    window.addEventListener('resize', resize);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35,
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
        {/* Title */}
        <div style={{ marginBottom: 8 }}>
          <GlitchText
            text="神託システム"
            style={{
              fontSize: 42, fontWeight: 900,
              color: C.cyan,
              textShadow: `0 0 20px ${C.cyan}, 0 0 40px ${C.cyan}60`,
              letterSpacing: '0.12em',
              display: 'block',
            }}
          />
        </div>
        <div style={{
          color: C.magenta, fontSize: 13,
          fontFamily: "'Courier New', monospace",
          letterSpacing: '0.3em', textTransform: 'uppercase',
          textShadow: `0 0 12px ${C.magenta}`,
          marginBottom: 48,
        }}>
          ORACLE_SYS v1.0
        </div>

        {/* Description */}
        <p style={{
          color: C.text, fontSize: 15, lineHeight: 1.8,
          marginBottom: 48,
        }}>
          あなたの過去・現在・未来を<br />
          AIが神秘の力で読み解きます
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/api-key')}
          className="neon-btn"
          style={{
            width: '100%', padding: '18px 32px',
            fontSize: 16, fontWeight: 700,
            fontFamily: "'Courier New', monospace",
            letterSpacing: '0.1em',
          }}
        >
          [ 起動する ]
        </button>

        {/* Decorative grid lines */}
        <div style={{
          marginTop: 48,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
        }}>
          {['恋愛運', '仕事運', '金運'].map(label => (
            <div key={label} style={{
              border: `1px solid ${C.border}`,
              borderRadius: 6, padding: '8px 4px',
              color: C.textDim, fontSize: 11,
              fontFamily: 'monospace',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Entertainment disclaimer */}
        <p style={{
          color: C.textMuted, fontSize: 10,
          lineHeight: 1.7, marginTop: 32,
          fontFamily: 'monospace',
        }}>
          占い結果はエンターテインメント目的であり、医療・法律・<br />
          金融上のアドバイスではありません。
        </p>
      </div>
    </div>
  );
}
