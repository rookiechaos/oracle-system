import { FortuneStyle, LuckLevel } from '../types';

export const LUCK_LABELS: Record<LuckLevel, string> = {
  daikichi: '大吉',
  kichi:    '吉',
  chukichi: '中吉',
  shokichi: '小吉',
  kyo:      '凶',
};

const OMikuji_RE = /(大吉|中吉|小吉|吉|凶)/;

const LABEL_TO_LEVEL: Record<string, LuckLevel> = {
  '大吉': 'daikichi',
  '中吉': 'chukichi',
  '小吉': 'shokichi',
  '吉':   'kichi',
  '凶':   'kyo',
};

/** Parse omikuji luck from the opening of an AI response. */
export function parseLuckLevel(response: string, style: FortuneStyle): LuckLevel | null {
  if (style !== 'omikuji') return null;
  const head = response.trim().slice(0, 80);
  const match = head.match(OMikuji_RE);
  if (!match) return null;
  return LABEL_TO_LEVEL[match[1]] ?? null;
}

/** Stored luckLevel, or re-parse legacy rows from response text. */
export function getEffectiveLuckLevel(
  fortune: { response: string; style: FortuneStyle; luckLevel: LuckLevel | null },
): LuckLevel | null {
  return fortune.luckLevel ?? parseLuckLevel(fortune.response, fortune.style);
}

export const LUCK_LEVELS: LuckLevel[] = ['daikichi', 'kichi', 'chukichi', 'shokichi', 'kyo'];
