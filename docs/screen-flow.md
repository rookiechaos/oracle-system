# 画面フロー / Screen Flow

[← ドキュメント一覧](README.md) · [English section ↓](#english)

## ルート一覧

| パス | 画面 | ガード |
|------|------|--------|
| `/` | Welcome | なし |
| `/api-key` | API キー設定 | なし |
| `/api-key-help` | キー取得ガイド | なし |
| `/profile` | プロフィール（初回） | API キー必須 |
| `/settings/profile` | プロフィール（編集） | プロフィール必須 |
| `/home` | ホーム | プロフィール必須 |
| `/ask` | 占い入力 | プロフィール必須 |
| `/reveal/:id` | 結果表示 | プロフィール必須 |
| `/history` | 履歴 | プロフィール必須 |
| `/settings` | 設定 | プロフィール必須 |

ルーティングは `HashRouter` のため、実 URL は `https://example.com/#/home` 形式。

## 初回オンボーディング

```mermaid
flowchart LR
  W[Welcome] --> AK[API Key]
  AK --> PH[Profile<br/>/profile]
  PH --> H[Home]
```

## メインフロー

```mermaid
flowchart TB
  H[Home] --> A[Ask]
  H --> HI[History]
  H --> S[Settings]

  A -->|"AI 生成"| R[Reveal /reveal/:id]
  HI -->|"詳細 › ?instant=1"| R
  R --> A
  R --> HI
  R --> H

  S --> SP[Settings Profile<br/>/settings/profile]
  SP --> S
  S --> AK2[API Key]
```

## 占い生成シーケンス

```mermaid
sequenceDiagram
  participant U as User
  participant Ask as Ask screen
  participant Hook as useFortune
  participant DB as IndexedDB
  participant AI as OpenAI / Anthropic
  participant Rev as Reveal

  U->>Ask: 方式・質問を入力
  Ask->>Hook: generate()
  Hook->>DB: 直近履歴を読む
  Hook->>AI: system + user prompt
  AI-->>Hook: 占い文
  Hook->>DB: saveFortune()
  Hook-->>Ask: fortuneId
  Ask->>Rev: navigate /reveal/:id
  Rev->>DB: getFortuneById()
  Rev-->>U: タイプライター表示
```

---

<a id="english"></a>

## English

### Routes

Same table as above — all paths are hash-based (`/#/home`, etc.).

### Onboarding

`Welcome → API key → Profile (/profile) → Home`

### Main loop

From Home, users can start a reading (`Ask`), browse `History`, or open `Settings`. After AI generation, `Reveal` shows the result with a typewriter effect. Invalid or missing fortune IDs show an error state with navigation options.

### Fortune sequence

`Ask` calls `useFortune.generate()`, which loads recent history from IndexedDB, calls the chosen AI provider, saves the result, then navigates to `Reveal/:id`.
