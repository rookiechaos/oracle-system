import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { getAIConfig, saveAIConfig } from '../storage/keychain';
import { getProfile } from '../db/queries';

export function ApiKey() {
  const navigate  = useNavigate();
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('anthropic');
  const [apiKey, setApiKey]     = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState('');
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const config = getAIConfig();
    if (config) {
      setProvider(config.providerType);
      setApiKey(config.apiKey);
    }
    getProfile().then(p => setHasProfile(!!p));
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください。');
      return;
    }
    const prefix = provider === 'openai' ? 'sk-' : 'sk-ant-';
    if (!apiKey.trim().startsWith(prefix)) {
      setError(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'}のAPIキーは「${prefix}」で始まります。`);
      return;
    }
    saveAIConfig({ providerType: provider, apiKey: apiKey.trim() });
    const profile = await getProfile();
    navigate(profile ? '/settings' : '/profile');
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', maxWidth: 480, margin: '0 auto' }}>
      {hasProfile && (
        <button
          onClick={() => navigate('/settings')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.cyan, fontSize: 14, padding: 0, marginBottom: 20,
            fontFamily: 'monospace',
          }}
        >
          ← 戻る
        </button>
      )}

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ color: C.textDim, fontSize: 12, fontFamily: 'monospace', marginBottom: 8 }}>
          {hasProfile ? 'SETTINGS — API設定' : 'STEP 1/2 — API設定'}
        </div>
        <h1 style={{
          color: C.cyan, fontSize: 28, margin: 0,
          textShadow: `0 0 16px ${C.cyan}`,
        }}>
          AIキーを設定
        </h1>
        <p style={{ color: C.text, fontSize: 14, marginTop: 12, lineHeight: 1.7 }}>
          APIキーはこの端末にのみ保存され、<br />
          OpenAI / Anthropicに直接送信されます。
        </p>
      </div>

      {/* Provider selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ color: C.textDim, fontSize: 12, fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>
          // AIプロバイダー
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {(['anthropic', 'openai'] as const).map(p => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              style={{
                background: provider === p ? C.cyanDim : C.bgCard,
                border: `1px solid ${provider === p ? C.cyan : C.border}`,
                borderRadius: 8, padding: '14px 12px',
                cursor: 'pointer', color: provider === p ? C.cyan : C.text,
                fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                boxShadow: provider === p ? `0 0 10px ${C.cyan}30` : 'none',
                transition: 'all 0.2s',
              }}
            >
              {p === 'anthropic' ? 'Anthropic' : 'OpenAI'}
              <div style={{ fontSize: 10, color: provider === p ? C.cyanBorder : C.textDim, marginTop: 4 }}>
                {p === 'anthropic' ? 'Claude モデル' : 'GPT-4o モデル'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key input */}
      <div style={{ marginBottom: 8 }}>
        <label style={{ color: C.textDim, fontSize: 12, fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>
          // APIキー
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={show ? 'text' : 'password'}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setError(''); }}
            placeholder={provider === 'anthropic' ? 'sk-ant-api03-...' : 'sk-proj-...'}
            autoComplete="off"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: C.bgCard, border: `1px solid ${C.cyanBorder}`,
              borderRadius: 8, color: C.text, fontSize: 14,
              padding: '14px 48px 14px 14px', fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.textDim, fontSize: 16,
            }}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>
        {error && (
          <p style={{ color: C.red, fontSize: 12, margin: '8px 0 0', fontFamily: 'monospace' }}>
            {error}
          </p>
        )}
      </div>

      {/* Help link */}
      <button
        onClick={() => navigate('/api-key-help')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.magenta, fontSize: 13, padding: 0,
          textDecoration: 'underline', marginBottom: 32,
        }}
      >
        APIキーの取得方法は？
      </button>

      {/* Security note */}
      <div style={{
        background: C.bgCardAlt,
        border: `1px solid ${C.greenBorder}`,
        borderRadius: 8, padding: '12px 14px',
        marginBottom: 16,
      }}>
        <p style={{ color: C.green, fontSize: 12, margin: 0, lineHeight: 1.7, fontFamily: 'monospace' }}>
          🔒 セキュリティ: APIキーはこのデバイスのブラウザにのみ保存され、<br />
          開発者サーバーには送信されません（AIプロバイダーへは直接送信）。
        </p>
      </div>

      {/* ToS acknowledgment */}
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 8, padding: '12px 14px',
        marginBottom: 32,
      }}>
        <p style={{ color: C.textDim, fontSize: 11, margin: 0, lineHeight: 1.8, fontFamily: 'monospace' }}>
          📋 APIキーを使用することで、{provider === 'anthropic'
            ? 'Anthropic の利用規約 (anthropic.com/legal/usage-policy)'
            : 'OpenAI の利用規約 (openai.com/policies/usage-policies)'
          } に同意したものとみなされます。
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={!apiKey.trim()}
        className="neon-btn"
        style={{
          width: '100%', padding: '18px',
          fontSize: 16, fontFamily: 'monospace', fontWeight: 700,
          opacity: apiKey.trim() ? 1 : 0.4,
        }}
      >
        {hasProfile ? '[ 保存する ]' : '[ 保存して次へ ]'}
      </button>
    </div>
  );
}
