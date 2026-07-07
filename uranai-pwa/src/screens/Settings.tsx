import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { useProfile } from '../hooks/useProfile';
import { clearAIConfig, getAIConfig } from '../storage/keychain';
import { deleteAllFortunes } from '../db/queries';

export function Settings() {
  const navigate              = useNavigate();
  const { profile }           = useProfile();
  const config                = getAIConfig();
  const [confirm, setConfirm] = useState<'history' | 'credentials' | null>(null);
  const [done, setDone]       = useState('');

  const handleDeleteHistory = async () => {
    await deleteAllFortunes();
    setConfirm(null);
    setDone('占い履歴をすべて削除しました。');
  };

  const handleClearCredentials = () => {
    clearAIConfig();
    setConfirm(null);
    navigate('/api-key', { replace: true });
  };

  const Section = ({ title }: { title: string }) => (
    <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', marginTop: 28, marginBottom: 10 }}>
      // {title}
    </div>
  );

  const Row = ({
    label, value, sub, danger, onClick,
  }: { label: string; value?: string; sub?: string; danger?: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: C.bgCard, border: `1px solid ${danger ? C.red + '40' : C.border}`,
        borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
        marginBottom: 8, textAlign: 'left',
      }}
    >
      <div>
        <div style={{ color: danger ? C.red : C.text, fontSize: 14 }}>{label}</div>
        {sub && <div style={{ color: C.textDim, fontSize: 11, marginTop: 3, fontFamily: 'monospace' }}>{sub}</div>}
      </div>
      {value ? (
        <span style={{ color: C.textDim, fontSize: 13, fontFamily: 'monospace' }}>{value}</span>
      ) : (
        <span style={{ color: danger ? C.red : C.cyan, fontSize: 16 }}>›</span>
      )}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px 60px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.cyan, fontSize: 14, padding: 0, fontFamily: 'monospace' }}
        >
          ← 戻る
        </button>
        <h1 style={{ color: C.cyan, fontSize: 22, margin: 0 }}>設定</h1>
      </div>

      {done && (
        <div style={{
          background: C.greenDim, border: `1px solid ${C.greenBorder}`,
          borderRadius: 8, padding: '10px 14px', margin: '16px 0',
        }}>
          <p style={{ color: C.green, fontSize: 13, margin: 0, fontFamily: 'monospace' }}>{done}</p>
        </div>
      )}

      <Section title="プロフィール" />
      <Row
        label={profile?.name ? `${profile.name}さん` : 'プロフィール未設定'}
        sub={profile ? `${profile.birthDate} / ${profile.bloodType}型 / ${profile.starSign}` : undefined}
        onClick={() => navigate('/settings/profile')}
      />

      <Section title="AI設定" />
      <Row
        label="AIプロバイダー"
        value={config ? (config.providerType === 'anthropic' ? 'Anthropic' : 'OpenAI') : '未設定'}
        onClick={() => navigate('/api-key')}
      />
      <Row
        label="APIキーを変更"
        sub={config ? `sk-***...` : '未設定'}
        onClick={() => navigate('/api-key')}
      />

      <Section title="データ管理" />
      <Row
        label="占い履歴をすべて削除"
        danger
        sub="この操作は取り消せません"
        onClick={() => setConfirm('history')}
      />
      <Row
        label="APIキーを削除してリセット"
        danger
        sub="削除後は再設定が必要です"
        onClick={() => setConfirm('credentials')}
      />

      <Section title="このアプリについて" />
      <div style={{
        background: C.bgCard, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: '14px 16px',
      }}>
        <p style={{ color: C.textDim, fontSize: 12, margin: 0, lineHeight: 1.8, fontFamily: 'monospace' }}>
          神託システム v1.0<br />
          全データはこのデバイスのみに保存されます。<br />
          APIキーは開発者サーバーには送信されません（AIプロバイダーへは直接送信）。
        </p>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5,0,16,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, zIndex: 100,
        }}>
          <div style={{
            background: C.bgCard, border: `1px solid ${C.red}60`,
            borderRadius: 12, padding: '24px', maxWidth: 360, width: '100%',
          }}>
            <h3 style={{ color: C.red, margin: '0 0 12px', fontSize: 17 }}>
              {confirm === 'history' ? '占い履歴を削除しますか？' : 'APIキーを削除しますか？'}
            </h3>
            <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, margin: '0 0 24px' }}>
              {confirm === 'history'
                ? 'すべての占い履歴と振り返りが永久に削除されます。この操作は元に戻せません。'
                : 'APIキーが削除されます。次回使用時に再設定が必要になります。'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={confirm === 'history' ? handleDeleteHistory : handleClearCredentials}
                style={{
                  flex: 1, padding: '12px',
                  background: `${C.red}20`, border: `1px solid ${C.red}`,
                  borderRadius: 8, cursor: 'pointer', color: C.red,
                  fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
                }}
              >
                削除する
              </button>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  flex: 1, padding: '12px',
                  background: C.bgCardAlt, border: `1px solid ${C.border}`,
                  borderRadius: 8, cursor: 'pointer', color: C.textDim,
                  fontFamily: 'monospace', fontSize: 14,
                }}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
