import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { C } from '../theme';
import { Fortune } from '../types';
import { getFortuneById } from '../db/queries';
import { STYLE_LABELS } from '../ai/prompts';
import { getEffectiveLuckLevel, LUCK_LABELS } from '../ai/parse-luck';

const TYPEWRITER_SPEED = 18; // ms per char

type LoadState = 'loading' | 'ready' | 'error';

export function Reveal() {
  const navigate             = useNavigate();
  const { id }               = useParams<{ id: string }>();
  const [params]             = useSearchParams();
  const instant              = params.get('instant') === '1';
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]      = useState(false);
  const intervalRef          = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setFortune(null);
      setLoadState('error');
      return;
    }

    const fortuneId = Number(id);
    if (!Number.isInteger(fortuneId) || fortuneId <= 0) {
      setFortune(null);
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setFortune(null);

    getFortuneById(fortuneId).then(f => {
      if (cancelled) return;
      if (f) {
        setFortune(f);
        setLoadState('ready');
      } else {
        setFortune(null);
        setLoadState('error');
      }
    });

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!fortune) return;
    if (instant) {
      setDisplayed(fortune.response);
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      setDisplayed(fortune.response.substring(0, idx));
      if (idx >= fortune.response.length) {
        clearInterval(intervalRef.current!);
        setDone(true);
      }
    }, TYPEWRITER_SPEED);
    return () => clearInterval(intervalRef.current!);
  }, [fortune, instant]);

  const skipToEnd = () => {
    if (!fortune) return;
    clearInterval(intervalRef.current!);
    setDisplayed(fortune.response);
    setDone(true);
  };

  if (loadState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: C.textDim, fontFamily: 'monospace' }}>占い結果を読み込み中...</div>
      </div>
    );
  }

  if (loadState === 'error' || !fortune) {
    return (
      <div style={{ minHeight: '100vh', padding: '32px 24px 60px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          background: `${C.red}15`, border: `1px solid ${C.red}60`,
          borderRadius: 10, padding: '24px 20px', textAlign: 'center',
        }}>
          <p style={{ color: C.red, fontSize: 15, margin: '0 0 8px', fontFamily: 'monospace', fontWeight: 700 }}>
            占い結果が見つかりません
          </p>
          <p style={{ color: C.text, fontSize: 13, margin: 0, lineHeight: 1.7 }}>
            リンクが無効か、履歴が削除された可能性があります。
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <button
            onClick={() => navigate('/ask')}
            className="neon-btn"
            style={{ width: '100%', padding: '16px', fontSize: 15, fontFamily: 'monospace' }}
          >
            [ もう一度占う ]
          </button>
          <button
            onClick={() => navigate('/history')}
            style={{
              width: '100%', padding: '14px',
              background: C.bgCard, border: `1px solid ${C.border}`,
              borderRadius: 10, cursor: 'pointer',
              color: C.text, fontSize: 14, fontFamily: 'monospace',
            }}
          >
            占い履歴を見る
          </button>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.textDim, fontSize: 13, padding: '8px',
              fontFamily: 'monospace',
            }}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const dateStr = new Date(fortune.savedAt).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const luck = getEffectiveLuckLevel(fortune);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 60px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace' }}>{dateStr}</div>
          <div style={{
            color: C.magenta, fontSize: 12, fontFamily: 'monospace',
            border: `1px solid ${C.magentaBorder}`, borderRadius: 4,
            padding: '2px 8px', display: 'inline-block', marginTop: 6,
          }}>
            {STYLE_LABELS[fortune.style]}
          </div>
          {luck && (
            <div style={{
              color: C.yellow, fontSize: 12, fontFamily: 'monospace',
              border: `1px solid ${C.yellowBorder}`, borderRadius: 4,
              padding: '2px 8px', display: 'inline-block', marginTop: 6, marginLeft: 8,
            }}>
              {LUCK_LABELS[luck]}
            </div>
          )}
        </div>
        {!done && !instant && (
          <button
            onClick={skipToEnd}
            style={{
              background: 'none', border: `1px solid ${C.border}`,
              borderRadius: 6, cursor: 'pointer',
              color: C.textDim, fontSize: 12, padding: '4px 10px',
              fontFamily: 'monospace',
            }}
          >
            スキップ ››
          </button>
        )}
      </div>

      {/* Question */}
      {fortune.question && (
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: '10px 14px', marginBottom: 20,
        }}>
          <span style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace' }}>Q: </span>
          <span style={{ color: C.text, fontSize: 14 }}>{fortune.question}</span>
        </div>
      )}

      {/* Fortune text */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.cyanBorder}`,
        borderRadius: 10, padding: '20px',
        boxShadow: `0 0 24px ${C.cyan}15`,
        marginBottom: 28, minHeight: 200,
      }}>
        <p style={{
          color: C.text, fontSize: 15, lineHeight: 2.0,
          whiteSpace: 'pre-wrap', margin: 0,
        }}>
          {displayed}
          {!done && (
            <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: C.cyan, marginLeft: 2,
              animation: 'blink 0.8s step-end infinite',
              verticalAlign: 'text-bottom',
            }} />
          )}
        </p>
      </div>

      {/* Actions (only after typewriter done) */}
      {done && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fade-up 0.4s ease' }}>
          <button
            onClick={() => navigate('/ask')}
            className="neon-btn"
            style={{ width: '100%', padding: '16px', fontSize: 15, fontFamily: 'monospace' }}
          >
            [ もう一度占う ]
          </button>
          <button
            onClick={() => navigate('/history')}
            style={{
              width: '100%', padding: '14px',
              background: C.bgCard, border: `1px solid ${C.border}`,
              borderRadius: 10, cursor: 'pointer',
              color: C.text, fontSize: 14, fontFamily: 'monospace',
            }}
          >
            占い履歴を見る
          </button>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.textDim, fontSize: 13, padding: '8px',
              fontFamily: 'monospace',
            }}
          >
            ホームに戻る
          </button>
        </div>
      )}
    </div>
  );
}
