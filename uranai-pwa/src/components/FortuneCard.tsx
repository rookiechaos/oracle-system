import React, { useEffect, useState } from 'react';
import { Fortune } from '../types';
import { STYLE_LABELS } from '../ai/prompts';
import { getEffectiveLuckLevel, LUCK_LABELS } from '../ai/parse-luck';
import { C } from '../theme';
import { updateReflection, toggleFavorite } from '../db/queries';

interface Props {
  fortune: Fortune;
  onUpdate?: () => void;
  onOpen?: (id: number) => void;
  onDelete?: (id: number) => void;
  expanded?: boolean;
}

export function FortuneCard({ fortune, onUpdate, onOpen, onDelete, expanded = false }: Props) {
  const [open, setOpen]             = useState(expanded);
  const [reflection, setReflection] = useState(fortune.reflection ?? '');
  const [editing, setEditing]       = useState(false);
  const [favorited, setFavorited]     = useState(fortune.isFavorited);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const luck = getEffectiveLuckLevel(fortune);

  useEffect(() => {
    setReflection(fortune.reflection ?? '');
    setFavorited(fortune.isFavorited);
    setConfirmDelete(false);
  }, [fortune.id, fortune.reflection, fortune.isFavorited]);

  const date = new Date(fortune.savedAt).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleSaveReflection = async () => {
    await updateReflection(fortune.id, reflection);
    setEditing(false);
    onUpdate?.();
  };

  const handleToggleFavorite = async () => {
    const next = !favorited;
    setFavorited(next);
    await toggleFavorite(fortune.id, next);
    onUpdate?.();
  };

  const handleDelete = async () => {
    await onDelete?.(fortune.id);
    setConfirmDelete(false);
  };

  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px', cursor: 'pointer',
        }}
      >
        <button
          type="button"
          onClick={e => { e.stopPropagation(); handleToggleFavorite(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, lineHeight: 1, padding: 0,
            filter: favorited ? 'none' : 'grayscale(1) opacity(0.4)',
          }}
        >
          ★
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.cyan, fontSize: 12, fontFamily: 'monospace' }}>{date}</div>
          <div style={{
            color: C.text, fontSize: 14, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {fortune.question ?? '今日の運勢'}
          </div>
        </div>
        {luck && (
          <div style={{
            color: C.yellow, fontSize: 11, fontFamily: 'monospace',
            border: `1px solid ${C.yellowBorder}`, borderRadius: 4,
            padding: '2px 6px', whiteSpace: 'nowrap',
          }}>
            {LUCK_LABELS[luck]}
          </div>
        )}
        <div style={{
          color: C.magenta, fontSize: 11, fontFamily: 'monospace',
          border: `1px solid ${C.magentaBorder}`, borderRadius: 4,
          padding: '2px 6px', whiteSpace: 'nowrap',
        }}>
          {STYLE_LABELS[fortune.style]}
        </div>
        {onOpen && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onOpen(fortune.id); }}
            style={{
              background: C.cyanDim, border: `1px solid ${C.cyan}`,
              borderRadius: 6, cursor: 'pointer',
              color: C.cyan, fontSize: 11, padding: '4px 8px',
              fontFamily: 'monospace', whiteSpace: 'nowrap',
            }}
          >
            詳細 ›
          </button>
        )}
        <span style={{ color: C.textDim, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
          <p style={{
            color: C.text, fontSize: 14, lineHeight: 1.8,
            whiteSpace: 'pre-wrap', margin: '16px 0 12px',
          }}>
            {fortune.response}
          </p>

          <div style={{ marginTop: 12 }}>
            <div style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 }}>
              // 振り返り
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  placeholder="今日の占いを振り返って..."
                  rows={3}
                  style={{
                    background: C.bg, border: `1px solid ${C.cyanBorder}`,
                    borderRadius: 6, color: C.text, fontSize: 13,
                    padding: '8px 10px', resize: 'vertical', width: '100%',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={handleSaveReflection} style={{
                    background: C.cyanDim, border: `1px solid ${C.cyan}`,
                    borderRadius: 6, color: C.cyan, fontSize: 13,
                    padding: '6px 16px', cursor: 'pointer', fontFamily: 'monospace',
                  }}>
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReflection(fortune.reflection ?? ''); setEditing(false); }}
                    style={{
                      background: 'none', border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.textDim, fontSize: 13,
                      padding: '6px 16px', cursor: 'pointer',
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditing(true)}
                style={{
                  color: reflection ? C.text : C.textDim,
                  fontSize: 13, cursor: 'pointer',
                  padding: '8px 10px',
                  background: C.bgCardAlt,
                  borderRadius: 6,
                  border: `1px dashed ${C.border}`,
                  minHeight: 36,
                }}
              >
                {reflection || '+ 振り返りを追加...'}
              </div>
            )}
          </div>

          {onDelete && (
            <div style={{ marginTop: 16 }}>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    background: 'none', border: `1px solid ${C.red}40`,
                    borderRadius: 6, color: C.red, fontSize: 12,
                    padding: '8px 14px', cursor: 'pointer', fontFamily: 'monospace',
                  }}
                >
                  この占いを削除
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: C.textDim, fontSize: 12, fontFamily: 'monospace' }}>削除しますか？</span>
                  <button type="button" onClick={handleDelete} style={{
                    background: `${C.red}20`, border: `1px solid ${C.red}`,
                    borderRadius: 6, color: C.red, fontSize: 12,
                    padding: '6px 12px', cursor: 'pointer', fontFamily: 'monospace',
                  }}>
                    削除する
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} style={{
                    background: 'none', border: `1px solid ${C.border}`,
                    borderRadius: 6, color: C.textDim, fontSize: 12,
                    padding: '6px 12px', cursor: 'pointer',
                  }}>
                    キャンセル
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
