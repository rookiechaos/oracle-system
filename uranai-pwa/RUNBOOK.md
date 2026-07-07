# 神託システム — Seller's Runbook

Complete operational guide for building, deploying, and selling the AI fortune-telling PWA to Japanese customers.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Generate Icons](#generate-icons)
5. [Deploy to Vercel](#deploy-to-vercel)
6. [Sell via Gumroad](#sell-via-gumroad)
7. [User Onboarding Guide](#user-onboarding-guide)
8. [Privacy & Security](#privacy--security)
9. [Maintenance](#maintenance)

---

## Architecture Overview

```
User's phone
├── Browser (Chrome / Safari)
│   ├── React PWA (installed from your Vercel URL)
│   ├── IndexedDB  ← fortune history stored HERE only
│   └── localStorage ← API key stored HERE only
│
└── Direct HTTPS calls
    ├── → api.openai.com  (user's own key)
    └── → api.anthropic.com (user's own key)

Your Vercel server
└── Static files only (HTML + JS + CSS)
    No database, no backend, no auth, no logs
```

**Privacy guarantee**: You (the seller) see zero user data. No API keys, no fortune history, nothing.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | included with Node |
| Python 3 | any | https://python.org (for icon generation) |
| Vercel CLI | latest | `npm i -g vercel` |

---

## Local Development

```bash
# 1. Enter the PWA directory
cd uranai-pwa

# 2. Install dependencies (only first time)
npm install

# 3. Generate icons (only first time, or when you change design)
npm run assets

# 3b. Optional: copy and edit AI model IDs
cp .env.example .env.local

# 4. Start dev server
npm run dev
# → opens http://localhost:5173
```

The dev server has hot-reload. Changes to any `.tsx` or `.css` file refresh instantly.

**Testing the app locally:**

1. Open http://localhost:5173 in Chrome
2. Click [ 起動する ]
3. Enter any Anthropic or OpenAI key
4. Fill in profile → start divining

To test on your phone (same WiFi):
```bash
npm run dev -- --host
# Note the "Network: http://192.168.x.x:5173" URL and open it on phone
```

---

## Generate Icons

The icons in `public/` are auto-generated from a Python script. Run once before first deploy and again if you change the design.

```bash
npm run assets
# → creates public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
```

Requirements: Python 3 + Pillow (the script installs Pillow automatically on first run).

To customize the icon, edit `scripts/generate-assets.py`:
- Change `BG`, `CYAN`, `MAGENTA` colors
- Change the centre character (currently `占`)
- Change `char_size` for bigger/smaller text

---

## Deploy to Vercel

### First deployment

```bash
# 1. Login to Vercel (one-time, opens browser)
vercel login

# 2. Build and deploy
cd uranai-pwa
npm run build
vercel --prod
```

Build output: `do-not-upload/uranai-pwa/dist/` (configured in `vite.config.ts` and `vercel.json`).

Answer the setup questions:
- **Set up and deploy?** → Y
- **Which scope?** → your personal account
- **Link to existing project?** → N
- **Project name?** → `uranai-ai` (or anything you like)
- **Root Directory?** → `uranai-pwa`
- **Output Directory** → `../do-not-upload/uranai-pwa/dist` (auto from `vercel.json`)

Vercel will print your URL: `https://uranai-ai.vercel.app`

### Re-deploying after changes

```bash
npm run build && vercel --prod
```

One command. Takes ~30 seconds.

### Custom domain (optional, looks more professional)

In Vercel dashboard → Project → Settings → Domains → Add domain.
Cheap `.jp` domains (~$10/yr): Onamae.com, Namecheap.

---

## Sell via Gumroad

### Setup (one-time)

1. Create account at https://gumroad.com
2. Go to **Products → New Product → Digital Product**
3. Fill in:
   - **Name**: `神託AI占いアプリ — あなただけの占い師`
   - **Price**: ¥500〜¥1,500 (your choice; suggested ¥980 for impulse buy)
   - **Description**: paste the template below
4. Under **Content**: paste your Vercel URL
5. Publish

### Product description template (Japanese)

```
🔮 神託AI占いアプリ

スマホに追加するだけ！ あなただけのAI占い師が
毎日の運勢を丁寧に読み解きます。

【特徴】
✨ おみくじ・タロット・九星気学・四柱推命に対応
📱 ホーム画面に追加できるアプリ（PWA）
🔒 データはあなたの端末にのみ保存。完全プライベート
🧠 過去の占い結果を記憶して、どんどん精度が上がる
💬 今日の質問も受け付けます

【使い方】
1. OpenAI または Anthropicのアカウントを作る（無料）
2. APIキーを取得する（月100〜300円程度）
3. アプリにAPIキーを入力
4. 毎日占いを楽しむ！

【購入後】
URLをお送りします。スマホのブラウザで開いて
「ホーム画面に追加」するだけで完了です。

【プライバシー】
あなたのAPIキーと占い履歴は、あなたのスマホにのみ
保存されます。開発者には一切見えません。
```

### After a sale

Gumroad automatically emails the buyer your Vercel URL. Nothing else needed on your end.

---

## User Onboarding Guide

Share this with buyers who need help (Japanese):

### スマホへのインストール方法

**iPhoneの場合:**
1. Safariで URL を開く（Chromeは不可）
2. 画面下の共有ボタン（四角に矢印）をタップ
3. 「ホーム画面に追加」を選ぶ
4. 「追加」をタップ

**Androidの場合:**
1. Chromeで URL を開く
2. 右上のメニュー（点3つ）をタップ
3. 「ホーム画面に追加」を選ぶ

### APIキーの取得方法（Anthropic推奨）

1. https://console.anthropic.com にアクセス
2. メールアドレスでアカウント作成（無料）
3. 左メニュー「API Keys」→「Create Key」
4. 表示された `sk-ant-...` の文字列をコピー
5. アプリを開いて貼り付け

**費用**: 毎日使っても月200〜300円程度。使わない月は0円。

### 占い履歴の使い方

**履歴を見る**
1. ホーム画面右上の 📜、またはホームの「最近の占い」をタップ
2. 一覧は **20件ずつ** 読み込み。「さらに読み込む」で追加表示

**おみくじで絞り込む**
- 「すべて」タブの下に **大吉 · 吉 · 中吉 · 小吉 · 凶** ボタンあり
- タップでその運勢の占いだけ表示（再タップで解除）

**お気に入り**
- 「★ お気に入り」タブで保存した占いのみ表示
- 各カード左の ★ をタップで ON/OFF

**詳細を読む**
- カードの **「詳細 ›」** → 全文を即座に表示（タイプライターなし）

**1件削除**
1. カードを展開（▼）
2. 下部 **「この占いを削除」** → 確認 → 削除

**全削除**
- 設定 → 「占い履歴をすべて削除」

---

## Privacy & Security

### What is stored where

| Data | Location | Accessible by |
|------|----------|--------------|
| API key | `localStorage` (user's browser) | User only |
| Fortune history | IndexedDB (user's browser) | User only |
| User profile | IndexedDB (user's browser) | User only |
| App code | Vercel CDN | Public (read-only) |

### What the seller (you) cannot see

- API keys
- Fortune text
- Profile information
- Who is using the app

### Network calls

The app makes direct HTTPS calls from the user's browser to:
- `https://api.openai.com` (if OpenAI selected)
- `https://api.anthropic.com` (if Anthropic selected)

No calls go through your server. The service worker blocks these URLs from caching (NetworkOnly policy).

### If a user loses their data

IndexedDB and localStorage are per-browser. If a user clears browser data or switches phones, data is lost. Inform users of this limitation upfront.

---

## Maintenance

### Updating the AI model

Model IDs are configured via environment variables (see `.env.example`):

```bash
# uranai-pwa/.env.local
VITE_OPENAI_MODEL=gpt-4o
VITE_ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Defaults are read in `src/ai/client.ts`. Change `.env.local` locally, or set the same vars in your Vercel project **Environment Variables**, then redeploy.

For Vercel: Project → Settings → Environment Variables → add `VITE_OPENAI_MODEL` / `VITE_ANTHROPIC_MODEL`.

### CI / quality checks

GitHub Actions runs `npm ci && npm run build` in `uranai-pwa/` on push and pull requests (see `.github/workflows/ci.yml`).

Before deploying manually:

```bash
cd uranai-pwa && npm run build
# output → ../do-not-upload/uranai-pwa/dist/
```

Optional — stash local-only files before git push:

```bash
./scripts/stash-for-upload.sh
```

Dependency updates: `cd uranai-pwa && npm audit fix` (re-run `npm run build` after).

**npm audit note**: `package.json` includes `"overrides": { "esbuild": "^0.25.0" }` to fix the esbuild advisory without upgrading to Vite 8. Remaining Vite advisories (dev-server / Windows path handling) do not affect the static production build; resolving them requires `npm audit fix --force` → Vite 8 (breaking). Revisit on a planned Vite major upgrade.

### Updating prompts

Edit `src/ai/prompts.ts`. The `buildSystemPrompt` function controls the AI's persona and style.

### Adding a new fortune style

1. Add the new key to `FortuneStyle` in `src/types/index.ts`
2. Add labels and descriptions in `src/ai/prompts.ts`
3. Add icon to `StylePicker.tsx`
4. Add guide text in `buildSystemPrompt`

### Monitoring costs (yours: zero)

Since users use their own API keys, you have no API cost. Monitor Vercel bandwidth in the dashboard — it's free up to 100GB/month on the free plan.

### Releasing a new version

```bash
# Edit code
npm run build
vercel --prod
```

The PWA auto-updates on users' devices the next time they open it (controlled by the `autoUpdate` service worker policy in `vite.config.ts`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| 「APIキーが無効です」 | Wrong or expired key | Re-enter API key in Settings |
| 「利用制限に達しました」 | Rate limited | Wait a few minutes |
| 「タイムアウト」 | Poor network | Check connection, retry |
| App won't install on iPhone | Using Chrome | Must use Safari |
| Data disappeared | Browser cache cleared | No recovery; inform user to use "Add to Home Screen" to persist storage |
| Build fails `tsc` error | TypeScript issue | Run `npx tsc --noEmit` to see details |

---

## File Structure

```
uranai-pwa/
├── public/
│   ├── icon-192.png          ← PWA icon (generated)
│   ├── icon-512.png          ← PWA icon large (generated)
│   └── apple-touch-icon.png  ← iOS home screen icon (generated)
├── scripts/
│   └── generate-assets.py   ← Icon generator
├── src/
│   ├── ai/
│   │   ├── client.ts         ← OpenAI + Anthropic API calls
│   │   ├── context-builder.ts← Inject fortune history into prompt
│   │   ├── parse-luck.ts     ← Omikuji luck level parser
│   │   └── prompts.ts        ← System + user message builders
│   ├── components/
│   │   ├── FortuneCard.tsx   ← Fortune history card
│   │   ├── GlitchText.tsx    ← Cyberpunk glitch text effect
│   │   ├── LoadingOracle.tsx ← Animated loading state
│   │   └── StylePicker.tsx   ← Fortune style selector
│   ├── db/
│   │   ├── index.ts          ← IndexedDB setup (idb library)
│   │   └── queries.ts        ← All database operations
│   ├── hooks/
│   │   ├── useFortune.ts     ← Fortune generation + error handling
│   │   └── useProfile.ts     ← Profile CRUD
│   ├── screens/
│   │   ├── Welcome.tsx       ← Landing with matrix rain
│   │   ├── ApiKey.tsx        ← API key setup
│   │   ├── ApiKeyHelp.tsx    ← Step-by-step guide for non-tech users
│   │   ├── Profile.tsx       ← Profile (/profile onboarding, /settings/profile edit)
│   │   ├── Home.tsx          ← Main dashboard
│   │   ├── Ask.tsx           ← Fortune input + dispatch
│   │   ├── Reveal.tsx        ← Typewriter reveal (?instant=1 from history)
│   │   ├── History.tsx       ← Fortune archive + link to Reveal
│   │   └── Settings.tsx      ← App settings + data management
│   ├── storage/
│   │   └── keychain.ts       ← API key in localStorage
│   ├── types/
│   │   └── index.ts          ← TypeScript type definitions
│   ├── App.tsx               ← Router + route guards
│   ├── index.css             ← Global styles + animations
│   ├── main.tsx              ← React entry point
│   └── theme.ts              ← Color palette constants
├── index.html                ← PWA meta tags + apple-mobile-web-app
├── .env.example              ← Optional AI model overrides
├── vercel.json               ← Output: ../do-not-upload/uranai-pwa/dist
├── package.json
├── tsconfig.json
└── vite.config.ts            ← Vite + PWA plugin + workbox config
```
