import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { useProfile } from '../hooks/useProfile';
import { BloodType, FortuneStyle } from '../types';
import { STYLE_LABELS } from '../ai/prompts';

const STAR_SIGNS = ['おひつじ座', 'おうし座', 'ふたご座', 'かに座', 'しし座', 'おとめ座',
  'てんびん座', 'さそり座', 'いて座', 'やぎ座', 'みずがめ座', 'うお座'];

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB'];
const STYLES: FortuneStyle[]   = ['omikuji', 'tarot', 'kyusei', 'shichusuimei'];

interface Props { isOnboarding?: boolean }

export function Profile({ isOnboarding = false }: Props) {
  const navigate                  = useNavigate();
  const { profile, updateProfile } = useProfile();

  const [name, setName]       = useState('');
  const [birth, setBirth]     = useState('');
  const [blood, setBlood]     = useState<BloodType>('A');
  const [star, setStar]       = useState(STAR_SIGNS[0]);
  const [style, setStyle]     = useState<FortuneStyle>('omikuji');
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBirth(profile.birthDate);
      setBlood(profile.bloodType);
      setStar(profile.starSign);
      setStyle(profile.preferredStyle);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim())  { setError('名前を入力してください。'); return; }
    if (!birth)        { setError('生年月日を入力してください。'); return; }
    setSaving(true);
    await updateProfile({
      name: name.trim(), birthDate: birth,
      bloodType: blood, starSign: star, preferredStyle: style,
    });
    setSaving(false);
    navigate(isOnboarding ? '/home' : '/settings');
  };

  const Section = ({ label }: { label: string }) => (
    <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 8, marginTop: 20 }}>
      // {label}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 48px', maxWidth: 480, margin: '0 auto' }}>
      {!isOnboarding && (
        <button
          onClick={() => navigate('/settings')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.cyan, fontSize: 14, padding: 0, marginBottom: 20, fontFamily: 'monospace' }}
        >
          ← 戻る
        </button>
      )}

      <div style={{ marginBottom: 32 }}>
        <div style={{ color: C.textDim, fontSize: 12, fontFamily: 'monospace', marginBottom: 6 }}>
          {isOnboarding ? 'STEP 2/2 — プロフィール' : 'SETTINGS — プロフィール'}
        </div>
        <h1 style={{ color: C.cyan, fontSize: 26, margin: 0, textShadow: `0 0 14px ${C.cyan}` }}>
          プロフィール設定
        </h1>
        <p style={{ color: C.text, fontSize: 13, marginTop: 10, lineHeight: 1.7 }}>
          より精度の高い占いのために、あなたの情報を教えてください。
        </p>
      </div>

      {/* Name */}
      <Section label="名前" />
      <input
        type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }}
        placeholder="山田 花子"
        style={{
          width: '100%', boxSizing: 'border-box',
          background: C.bgCard, border: `1px solid ${C.cyanBorder}`,
          borderRadius: 8, color: C.text, fontSize: 15,
          padding: '12px 14px', fontFamily: 'inherit', outline: 'none',
        }}
      />

      {/* Birthdate */}
      <Section label="生年月日" />
      <input
        type="date" value={birth} onChange={e => { setBirth(e.target.value); setError(''); }}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: C.bgCard, border: `1px solid ${C.cyanBorder}`,
          borderRadius: 8, color: C.text, fontSize: 15,
          padding: '12px 14px', fontFamily: 'monospace', outline: 'none',
          colorScheme: 'dark',
        }}
      />

      {/* Blood type */}
      <Section label="血液型" />
      <div style={{ display: 'flex', gap: 8 }}>
        {BLOOD_TYPES.map(b => (
          <button key={b} onClick={() => setBlood(b)} style={{
            flex: 1, padding: '10px 4px',
            background: blood === b ? C.magentaDim : C.bgCard,
            border: `1px solid ${blood === b ? C.magenta : C.border}`,
            borderRadius: 8, cursor: 'pointer',
            color: blood === b ? C.magenta : C.textDim,
            fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
          }}>
            {b}型
          </button>
        ))}
      </div>

      {/* Star sign */}
      <Section label="星座" />
      <select
        value={star} onChange={e => setStar(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: C.bgCard, border: `1px solid ${C.cyanBorder}`,
          borderRadius: 8, color: C.text, fontSize: 14,
          padding: '12px 14px', fontFamily: 'inherit', outline: 'none',
          appearance: 'none', cursor: 'pointer',
        }}
      >
        {STAR_SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Preferred style */}
      <Section label="お好みの占い方式" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {STYLES.map(s => (
          <button key={s} onClick={() => setStyle(s)} style={{
            padding: '10px', textAlign: 'center',
            background: style === s ? C.cyanDim : C.bgCard,
            border: `1px solid ${style === s ? C.cyan : C.border}`,
            borderRadius: 8, cursor: 'pointer',
            color: style === s ? C.cyan : C.textDim,
            fontFamily: 'monospace', fontSize: 13,
          }}>
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <p style={{ color: C.red, fontSize: 13, margin: '16px 0 0', fontFamily: 'monospace' }}>{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="neon-btn"
        style={{
          width: '100%', marginTop: 32, padding: '18px',
          fontSize: 16, fontFamily: 'monospace', fontWeight: 700,
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? '[ 保存中... ]' : (isOnboarding ? '[ 占いを始める ]' : '[ 保存する ]')}
      </button>
    </div>
  );
}
