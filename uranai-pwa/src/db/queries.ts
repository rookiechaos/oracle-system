import { getDatabase } from './index';
import { UserProfile, Fortune, FortuneStyle, LuckLevel } from '../types';
import { getEffectiveLuckLevel, parseLuckLevel } from '../ai/parse-luck';

export interface FortuneListOptions {
  limit: number;
  offset?: number;
  favoritedOnly?: boolean;
  luckLevel?: LuckLevel;
}

function passesFilters(
  fortune: Fortune,
  favoritedOnly?: boolean,
  luckLevel?: LuckLevel,
): boolean {
  if (favoritedOnly && !fortune.isFavorited) return false;
  if (luckLevel && getEffectiveLuckLevel(fortune) !== luckLevel) return false;
  return true;
}

async function walkFortunes(
  onRow: (fortune: Fortune) => boolean | void,
): Promise<void> {
  const db     = await getDatabase();
  const tx     = db.transaction('fortunes', 'readonly');
  let cursor   = await tx.store.index('by-date').openCursor(null, 'prev');
  while (cursor) {
    if (onRow(cursor.value as Fortune) === false) break;
    cursor = await cursor.continue();
  }
}

// ── Profile ──────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile | null> {
  const db  = await getDatabase();
  const row = await db.get('profile', 1) as any;
  if (!row) return null;
  return row as UserProfile;
}

export async function saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<void> {
  const db      = await getDatabase();
  const existing = await db.get('profile', 1) as UserProfile | undefined;
  await db.put('profile', {
    id:        1,
    ...profile,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
}

// ── Fortunes ─────────────────────────────────────────────

export async function saveFortune(fortune: {
  question: string | null;
  style: FortuneStyle;
  response: string;
  luckLevel: LuckLevel | null;
}): Promise<number> {
  const db = await getDatabase();
  const id = await db.add('fortunes', {
    ...fortune,
    luckLevel:   fortune.luckLevel ?? parseLuckLevel(fortune.response, fortune.style),
    savedAt:     new Date().toISOString(),
    reflection:  null,
    isFavorited: false,
  });
  return id as number;
}

export async function getFortuneById(id: number): Promise<Fortune | null> {
  const db  = await getDatabase();
  const row = await db.get('fortunes', id) as any;
  return row ? (row as Fortune) : null;
}

export async function countFortunes(options?: Pick<FortuneListOptions, 'favoritedOnly' | 'luckLevel'>): Promise<number> {
  if (!options?.favoritedOnly && !options?.luckLevel) {
    const db = await getDatabase();
    return db.count('fortunes');
  }
  let n = 0;
  await walkFortunes(f => {
    if (passesFilters(f, options.favoritedOnly, options.luckLevel)) n++;
  });
  return n;
}

export async function listFortunes(options: FortuneListOptions): Promise<{ items: Fortune[]; hasMore: boolean }> {
  const { limit, offset = 0, favoritedOnly, luckLevel } = options;
  const items: Fortune[] = [];
  let skipped = 0;

  await walkFortunes(f => {
    if (!passesFilters(f, favoritedOnly, luckLevel)) return;
    if (skipped < offset) {
      skipped++;
      return;
    }
    items.push(f);
    return items.length <= limit;
  });

  const hasMore = items.length > limit;
  if (hasMore) items.pop();
  return { items, hasMore };
}

export async function getRecentFortunes(limit = 10): Promise<Fortune[]> {
  const { items } = await listFortunes({ limit, offset: 0 });
  return items;
}

export async function updateReflection(id: number, reflection: string): Promise<void> {
  const db      = await getDatabase();
  const fortune = await db.get('fortunes', id) as any;
  if (!fortune) return;
  await db.put('fortunes', { ...fortune, reflection });
}

export async function toggleFavorite(id: number, isFavorited: boolean): Promise<void> {
  const db      = await getDatabase();
  const fortune = await db.get('fortunes', id) as any;
  if (!fortune) return;
  await db.put('fortunes', { ...fortune, isFavorited });
}

export async function deleteFortune(id: number): Promise<void> {
  const db = await getDatabase();
  await db.delete('fortunes', id);
}

export async function deleteAllFortunes(): Promise<void> {
  const db = await getDatabase();
  await db.clear('fortunes');
}
