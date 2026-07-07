import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../theme';
import { StylePicker } from '../components/StylePicker';
import { LoadingOracle } from '../components/LoadingOracle';
import { useProfile } from '../hooks/useProfile';
import { useFortune } from '../hooks/useFortune';
import { getAIConfig } from '../storage/keychain';
import { FortuneStyle } from '../types';

export function Ask() {
  const navigate              = useNavigate();
  const [params]              = useSearchParams();
  const { profile }           = useProfile();
  const { loading, error, fortuneId, generate, reset } = useFortune();

  const [style, setStyle]     = useState<FortuneStyle>('omikuji');
  const [question, setQuestion] = useState('');
  const questionRef             = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (profile?.preferredStyle) setStyle(profile.preferredStyle);
  }, [profile?.preferredStyle]);

  useEffect(() => {
    if (params.get('quick')) questionRef.current?.focus();
  }, [params]);

  useEffect(() => {
    if (fortuneId !== null) {
      navigate(`/reveal/${fortuneId}`, { replace: true });
    }
  }, [fortuneId, navigate]);

  const handleGo = async () => {
    if (!profile) return;
    const config = getAIConfig();
    if (!config) { navigate('/api-key'); return; }
    await generate(style, question.trim() || null, profile, config);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingOracle />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 60px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.cyan, fontSize: 14, padding: 0, fontFamily: 'monospace' }}
        >
          ← 戻る
        </button>
        <h1 style={{ color: C.cyan, fontSize: 22, margin: 0, flex: 1, textShadow: `0 0 12px ${C.cyan}` }}>
          占いを始める
        </h1>
      </div>

      {/* Style picker */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 12 }}>
          // 占い方式を選択
        </div>
        <StylePicker value={style} onChange={setStyle} />
      </div>

      {/* Question input */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 12 }}>
          // 質問（省略で今日の運勢）
        </div>
        <textarea
          ref={questionRef}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="例: 仕事で良いことはありますか？&#10;例: 今の恋愛はうまくいきますか？"
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: C.bgCard, border: `1px solid ${C.cyanBorder}`,
            borderRadius: 8, color: C.text, fontSize: 14,
            padding: '12px 14px', fontFamily: 'inherit', resize: 'none',
            outline: 'none', lineHeight: 1.7,
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: `${C.red}15`, border: `1px solid ${C.red}60`,
          borderRadius: 8, padding: '12px 14px', marginBottom: 20,
        }}>
          <p style={{ color: C.red, fontSize: 13, margin: 0, fontFamily: 'monospace', lineHeight: 1.6 }}>
            ⚠️ {error}
          </p>
          <button
            onClick={reset}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.cyan, fontSize: 12, marginTop: 8, padding: 0, fontFamily: 'monospace' }}
          >
            もう一度試す
          </button>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleGo}
        disabled={!profile}
        className="neon-btn"
        style={{
          width: '100%', padding: '20px',
          fontSize: 17, fontFamily: 'monospace', fontWeight: 900,
          opacity: profile ? 1 : 0.4,
        }}
      >
        [ 神託を受け取る ]
      </button>

      <p style={{ color: C.textDim, fontSize: 11, textAlign: 'center', marginTop: 16, fontFamily: 'monospace' }}>
        ※ AIに問い合わせるため、数秒かかります
      </p>
    </div>
  );
}
