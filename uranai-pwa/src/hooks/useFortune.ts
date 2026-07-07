import { useState, useCallback } from 'react';
import { FortuneStyle, UserProfile, AIConfig } from '../types';
import { buildSystemPrompt, buildUserMessage } from '../ai/prompts';
import { buildHistoryContext } from '../ai/context-builder';
import { callAI } from '../ai/client';
import { parseLuckLevel } from '../ai/parse-luck';
import { saveFortune } from '../db/queries';

interface UseFortuneResult {
  loading: boolean;
  error: string | null;
  fortuneId: number | null;
  generate: (style: FortuneStyle, question: string | null, profile: UserProfile, config: AIConfig) => Promise<void>;
  reset: () => void;
}

export function useFortune(): UseFortuneResult {
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [fortuneId, setFortuneId] = useState<number | null>(null);

  const generate = useCallback(async (
    style: FortuneStyle,
    question: string | null,
    profile: UserProfile,
    config: AIConfig,
  ) => {
    setLoading(true);
    setError(null);
    setFortuneId(null);
    try {
      const historyContext = await buildHistoryContext(7);
      const systemPrompt   = buildSystemPrompt(style, profile);
      const userMessage    = buildUserMessage(question, profile, historyContext);
      const response       = await callAI(config, systemPrompt, userMessage);
      const luckLevel      = parseLuckLevel(response, style);
      const id             = await saveFortune({ question, style, response, luckLevel });
      setFortuneId(id);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setError('接続がタイムアウトしました。ネットワークを確認してもう一度お試しください。');
      } else {
        setError(e.message ?? '占いに失敗しました。もう一度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setFortuneId(null);
  }, []);

  return { loading, error, fortuneId, generate, reset };
}
