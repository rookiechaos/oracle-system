export type FortuneStyle = 'omikuji' | 'tarot' | 'kyusei' | 'shichusuimei';
export type LuckLevel = 'daikichi' | 'kichi' | 'chukichi' | 'shokichi' | 'kyo';
export type BloodType = 'A' | 'B' | 'O' | 'AB';
export type AIProviderType = 'openai' | 'anthropic';

export interface UserProfile {
  id: number;
  name: string;
  birthDate: string;
  bloodType: BloodType;
  starSign: string;
  preferredStyle: FortuneStyle;
  createdAt: string;
}

export interface Fortune {
  id: number;
  question: string | null;
  style: FortuneStyle;
  response: string;
  luckLevel: LuckLevel | null;
  savedAt: string;
  reflection: string | null;
  isFavorited: boolean;
}

export interface AIConfig {
  providerType: AIProviderType;
  apiKey: string;
}
