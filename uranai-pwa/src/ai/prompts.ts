import { FortuneStyle, UserProfile } from '../types';

export const STYLE_LABELS: Record<FortuneStyle, string> = {
  omikuji:      'おみくじ',
  tarot:        'タロット',
  kyusei:       '九星気学',
  shichusuimei: '四柱推命',
};

export const STYLE_DESCRIPTIONS: Record<FortuneStyle, string> = {
  omikuji:      '神社の伝統的なお告げ',
  tarot:        '西洋のタロット占い',
  kyusei:       '九星気学による運勢',
  shichusuimei: '生年月日による四柱推命',
};

export function buildSystemPrompt(style: FortuneStyle, profile: UserProfile): string {
  const base = `あなたは日本の伝統的な占い師です。温かく、神秘的で、深い洞察力を持っています。
ユーザーの過去の占い結果と個人情報を深く理解し、パーソナライズされた占いを提供します。
必ず日本語で回答してください。回答は詩的で美しい文体を使用してください。
回答は400〜600文字程度にまとめてください。`;

  const guides: Record<FortuneStyle, string> = {
    omikuji: `おみくじの形式で占います。「大吉・吉・中吉・小吉・凶」のいずれかを最初に示し、
恋愛、仕事、健康、金運の各項目についてのお告げを記してください。
最後に全体的なアドバイスを「神のお告げ」として締めくくります。`,

    tarot: `タロットカードの形式で占います。引いたカード名（日本語）を最初に示し、
そのカードが示す深い意味と現在の状況への解釈を提供してください。
正位置・逆位置の概念を使い、具体的なアドバイスで締めくくります。`,

    kyusei: `九星気学の観点から占います。${profile.birthDate}から算出される本命星の特徴を踏まえ、
現在の運気の流れ、吉方位、注意すべき点を丁寧に説明してください。`,

    shichusuimei: `四柱推命の観点から占います。${profile.birthDate}の命式を基に、
現在の大運・流年の影響を読み解き、具体的な運勢と開運のアドバイスを提供してください。`,
  };

  return `${base}\n\n${guides[style]}`;
}

export function buildUserMessage(
  question: string | null,
  profile: UserProfile,
  historyContext: string
): string {
  const profileSection = `【ユーザー情報】
名前: ${profile.name}さん
生年月日: ${profile.birthDate}
血液型: ${profile.bloodType}型
星座: ${profile.starSign}`;

  const historySection = historyContext
    ? `\n【過去の占い履歴】\n${historyContext}\n`
    : '';

  const questionSection = question
    ? `【今日のご質問】\n${question}`
    : `【今日の占い】\n今日の全体的な運勢をお願いします。`;

  return `${profileSection}\n${historySection}\n${questionSection}`;
}
