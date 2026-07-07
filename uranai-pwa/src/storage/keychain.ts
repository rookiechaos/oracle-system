import { AIConfig, AIProviderType } from '../types';

const PROVIDER_KEY = 'uranai_provider';
const API_KEY_KEY  = 'uranai_apikey';

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(PROVIDER_KEY, config.providerType);
  localStorage.setItem(API_KEY_KEY, config.apiKey);
}

export function getAIConfig(): AIConfig | null {
  const providerType = localStorage.getItem(PROVIDER_KEY);
  const apiKey       = localStorage.getItem(API_KEY_KEY);
  if (!providerType || !apiKey) return null;
  return { providerType: providerType as AIProviderType, apiKey };
}

export function clearAIConfig(): void {
  localStorage.removeItem(PROVIDER_KEY);
  localStorage.removeItem(API_KEY_KEY);
}
