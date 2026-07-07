import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';

const STEPS_ANTHROPIC = [
  { n: 1, title: 'アカウント作成', body: 'console.anthropic.com にアクセスし、メールアドレスでアカウントを作成します。' },
  { n: 2, title: 'APIキー発行', body: '左メニューの「API Keys」→「Create Key」をクリックします。名前は何でも構いません。' },
  { n: 3, title: 'コピー', body: '表示された「sk-ant-...」で始まる文字列をコピーします。この画面を閉じると再表示されません。' },
  { n: 4, title: 'アプリに貼り付け', body: '前の画面に戻り、入力欄に貼り付けます。' },
];

const STEPS_OPENAI = [
  { n: 1, title: 'アカウント作成', body: 'platform.openai.com にアクセスし、アカウントを作成します。' },
  { n: 2, title: 'APIキー発行', body: '右上のアイコン→「API keys」→「Create new secret key」をクリックします。' },
  { n: 3, title: 'コピー', body: '表示された「sk-...」で始まる文字列をコピーします。' },
  { n: 4, title: 'アプリに貼り付け', body: '前の画面に戻り、入力欄に貼り付けます。' },
];

export function ApiKeyHelp() {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState<'anthropic' | 'openai'>('anthropic');
  const steps = tab === 'anthropic' ? STEPS_ANTHROPIC : STEPS_OPENAI;

  return (
    <div style={{ minHeight: '100vh', padding: '24px 24px 40px', maxWidth: 480, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.cyan, fontSize: 14, padding: 0, marginBottom: 24,
          fontFamily: 'monospace',
        }}
      >
        ← 戻る
      </button>

      <h1 style={{ color: C.cyan, fontSize: 24, margin: '0 0 8px' }}>
        APIキーの取得方法
      </h1>
      <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, margin: '0 0 24px' }}>
        APIキーは月100〜300円程度のコストで使えます。<br />
        あなた自身のキーを使うため、データが外部に漏れることはありません。
      </p>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {(['anthropic', 'openai'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px',
              background: tab === t ? C.cyanDim : C.bgCard,
              border: `1px solid ${tab === t ? C.cyan : C.border}`,
              borderRadius: 8, cursor: 'pointer',
              color: tab === t ? C.cyan : C.textDim,
              fontFamily: 'monospace', fontSize: 13,
            }}
          >
            {t === 'anthropic' ? 'Anthropic' : 'OpenAI'}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {steps.map(step => (
          <div
            key={step.n}
            style={{
              display: 'flex', gap: 14,
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '14px 16px',
            }}
          >
            <div style={{
              width: 28, height: 28, minWidth: 28,
              borderRadius: '50%',
              background: C.cyanDim,
              border: `1px solid ${C.cyan}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.cyan, fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
            }}>
              {step.n}
            </div>
            <div>
              <div style={{ color: C.cyan, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                {step.title}
              </div>
              <div style={{ color: C.text, fontSize: 13, lineHeight: 1.7 }}>
                {step.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cost note */}
      <div style={{
        marginTop: 28,
        background: C.bgCardAlt,
        border: `1px solid ${C.yellowBorder ?? C.border}`,
        borderRadius: 8, padding: '14px 16px',
      }}>
        <p style={{ color: C.yellow, fontSize: 13, margin: 0, lineHeight: 1.7 }}>
          💡 <strong>費用の目安:</strong><br />
          毎日1回占いを行っても月額100〜300円程度です。<br />
          使った分だけ課金される従量制のため、使わない月は0円です。
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="neon-btn"
        style={{
          width: '100%', marginTop: 32, padding: '16px',
          fontSize: 15, fontFamily: 'monospace',
        }}
      >
        [ APIキー設定画面に戻る ]
      </button>
    </div>
  );
}
