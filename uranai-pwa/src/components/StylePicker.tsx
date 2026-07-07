import React from 'react';
import { FortuneStyle } from '../types';
import { STYLE_LABELS, STYLE_DESCRIPTIONS } from '../ai/prompts';
import { C } from '../theme';

const STYLE_ICONS: Record<FortuneStyle, string> = {
  omikuji:      '⛩️',
  tarot:        '🃏',
  kyusei:       '✨',
  shichusuimei: '🌙',
};

interface Props {
  value: FortuneStyle;
  onChange: (style: FortuneStyle) => void;
}

export function StylePicker({ value, onChange }: Props) {
  const styles: FortuneStyle[] = ['omikuji', 'tarot', 'kyusei', 'shichusuimei'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {styles.map(s => {
        const active = s === value;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              background: active ? C.cyanDim : C.bgCard,
              border: `1px solid ${active ? C.cyan : C.border}`,
              borderRadius: 8,
              padding: '14px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: active ? `0 0 12px ${C.cyan}40` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{STYLE_ICONS[s]}</div>
            <div style={{
              color: active ? C.cyan : C.text,
              fontSize: 14, fontWeight: 600,
              fontFamily: "'Courier New', monospace",
            }}>
              {STYLE_LABELS[s]}
            </div>
            <div style={{ color: C.textDim, fontSize: 11, marginTop: 3 }}>
              {STYLE_DESCRIPTIONS[s]}
            </div>
          </button>
        );
      })}
    </div>
  );
}
