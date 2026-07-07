import { getRecentFortunes } from '../db/queries';

export async function buildHistoryContext(limit = 7): Promise<string> {
  const fortunes = await getRecentFortunes(limit);
  if (fortunes.length === 0) return '';

  return fortunes
    .map((f, i) => {
      const date      = new Date(f.savedAt).toLocaleDateString('ja-JP');
      const question  = f.question ? `質問: ${f.question}` : '今日の運勢';
      const snippet   = f.response.substring(0, 120).replace(/\n/g, ' ');
      const reflection = f.reflection ? `\n  振り返り: ${f.reflection}` : '';
      return `${i + 1}. [${date}] ${question}\n  要点: ${snippet}...${reflection}`;
    })
    .join('\n\n');
}
