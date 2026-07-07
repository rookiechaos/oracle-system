import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import { Fortune, LuckLevel } from '../types';
import { countFortunes, deleteFortune, listFortunes } from '../db/queries';
import { FortuneCard } from '../components/FortuneCard';
import { LUCK_LABELS, LUCK_LEVELS } from '../ai/parse-luck';

const PAGE_SIZE = 20;

type TabFilter = 'all' | 'favorited';

export function History() {
  const navigate                = useNavigate();
  const [fortunes, setFortunes] = useState<Fortune[]>([]);
  const [tab, setTab]           = useState<TabFilter>('all');
  const [luckFilter, setLuck]   = useState<LuckLevel | null>(null);
  const [total, setTotal]       = useState(0);
  const [hasMore, setHasMore]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const queryOpts = useCallback(() => ({
    favoritedOnly: tab === 'favorited',
    luckLevel:     luckFilter ?? undefined,
  }), [tab, luckFilter]);

  const fetchPage = useCallback(async (offset: number) => {
    const opts = queryOpts();
    const [count, page] = await Promise.all([
      countFortunes(opts),
      listFortunes({ ...opts, limit: PAGE_SIZE, offset }),
    ]);
    return { count, ...page };
  }, [queryOpts]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPage(0).then(({ count, items, hasMore: more }) => {
      if (cancelled) return;
      setTotal(count);
      setFortunes(items);
      setHasMore(more);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [fetchPage]);

  const reload = useCallback(async () => {
    const { count, items, hasMore: more } = await fetchPage(0);
    setTotal(count);
    setFortunes(items);
    setHasMore(more);
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    const { items, hasMore: more } = await fetchPage(fortunes.length);
    setFortunes(prev => [...prev, ...items]);
    setHasMore(more);
    setLoadingMore(false);
  };

  const handleDelete = async (id: number) => {
    await deleteFortune(id);
    await reload();
  };

  const emptyMessage = tab === 'favorited'
    ? 'お気に入りはまだありません'
    : luckFilter
      ? `${LUCK_LABELS[luckFilter]}の占い履歴がありません`
      : '占い履歴がありません';

  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px 60px', maxWidth: 540, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.cyan, fontSize: 14, padding: 0, fontFamily: 'monospace' }}
        >
          ← 戻る
        </button>
        <h1 style={{ color: C.cyan, fontSize: 22, margin: 0, flex: 1 }}>占い履歴</h1>
        <span style={{ color: C.textDim, fontSize: 13, fontFamily: 'monospace' }}>
          {total}件
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['all', 'favorited'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setTab(f); setLuck(null); }}
            style={{
              padding: '8px 16px',
              background: tab === f && !luckFilter ? C.cyanDim : C.bgCard,
              border: `1px solid ${tab === f && !luckFilter ? C.cyan : C.border}`,
              borderRadius: 20, cursor: 'pointer',
              color: tab === f && !luckFilter ? C.cyan : C.textDim,
              fontFamily: 'monospace', fontSize: 13,
            }}
          >
            {f === 'all' ? 'すべて' : '★ お気に入り'}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ color: C.textDim, fontSize: 11, fontFamily: 'monospace', alignSelf: 'center' }}>
            // おみくじ
          </span>
          {LUCK_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setLuck(luckFilter === level ? null : level)}
              style={{
                padding: '6px 12px',
                background: luckFilter === level ? `${C.yellow}18` : C.bgCard,
                border: `1px solid ${luckFilter === level ? C.yellowBorder : C.border}`,
                borderRadius: 16, cursor: 'pointer',
                color: luckFilter === level ? C.yellow : C.textDim,
                fontFamily: 'monospace', fontSize: 12,
              }}
            >
              {LUCK_LABELS[level]}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ color: C.textDim, textAlign: 'center', padding: 40, fontFamily: 'monospace' }}>
          読み込み中...
        </div>
      ) : fortunes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌙</div>
          <p style={{ color: C.textDim, fontSize: 14, fontFamily: 'monospace' }}>{emptyMessage}</p>
          {tab === 'all' && !luckFilter && (
            <button
              onClick={() => navigate('/ask')}
              className="neon-btn"
              style={{ marginTop: 20, padding: '14px 32px', fontFamily: 'monospace', fontSize: 14 }}
            >
              [ 最初の占いをする ]
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fortunes.map(f => (
              <FortuneCard
                key={f.id}
                fortune={f}
                onUpdate={reload}
                onOpen={id => navigate(`/reveal/${id}?instant=1`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                width: '100%', marginTop: 16, padding: '14px',
                background: C.bgCard, border: `1px solid ${C.border}`,
                borderRadius: 10, cursor: loadingMore ? 'wait' : 'pointer',
                color: C.textDim, fontSize: 13, fontFamily: 'monospace',
              }}
            >
              {loadingMore ? '読み込み中...' : `[ さらに読み込む (${fortunes.length}/${total}) ]`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
