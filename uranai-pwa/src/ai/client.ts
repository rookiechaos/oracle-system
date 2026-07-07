import { AIConfig } from '../types';

const TIMEOUT_MS = 30_000;
const OPENAI_MODEL     = import.meta.env.VITE_OPENAI_MODEL     ?? 'gpt-4o';
const ANTHROPIC_MODEL  = import.meta.env.VITE_ANTHROPIC_MODEL  ?? 'claude-sonnet-4-20250514';

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function callAI(
  config: AIConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  return config.providerType === 'openai'
    ? callOpenAI(config.apiKey, systemPrompt, userMessage)
    : callAnthropic(config.apiKey, systemPrompt, userMessage);
}

async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string) {
  const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.85,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('APIキーが無効です。設定画面でAPIキーを確認してください。');
    if (res.status === 429) throw new Error('APIの利用制限に達しました。しばらくしてからお試しください。');
    if (res.status >= 500) throw new Error('OpenAIサーバーに問題が発生しています。しばらくしてからお試しください。');
    throw new Error((err as any)?.error?.message ?? 'OpenAIへの接続に失敗しました');
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('OpenAIから空の応答が返されました。もう一度お試しください。');
  }
  return content;
}

async function callAnthropic(apiKey: string, systemPrompt: string, userMessage: string) {
  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-api-key':       apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      ANTHROPIC_MODEL,
      max_tokens: 1000,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('APIキーが無効です。設定画面でAPIキーを確認してください。');
    if (res.status === 429) throw new Error('APIの利用制限に達しました。しばらくしてからお試しください。');
    if (res.status >= 500) throw new Error('Anthropicサーバーに問題が発生しています。しばらくしてからお試しください。');
    throw new Error((err as any)?.error?.message ?? 'Anthropicへの接続に失敗しました');
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text || typeof text !== 'string') {
    throw new Error('Anthropicから空の応答が返されました。もう一度お試しください。');
  }
  return text;
}
