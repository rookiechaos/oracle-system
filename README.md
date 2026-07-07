# 神託システム / Oracle System

<p align="center">
  <strong>日本語</strong> · <a href="#english">English</a>
</p>

サイバーパンク風 UI の **AI 占い PWA**。ユーザーの端末に API キーと占い履歴を保存し、OpenAI / Anthropic へ **ブラウザから直接** リクエストします。バックエンド不要・完全クライアントサイド。

**図解ドキュメント:** [docs/](docs/README.md)（アーキテクチャ · 画面フロー · ロードマップ）  
**Cursor Canvas:** ローカル IDE 用の `Oracle System Overview`（本リポジトリには含まれません）

---

## 概要

| 項目 | 内容 |
|------|------|
| メインアプリ | `uranai-pwa/` — React + Vite + TypeScript PWA |
| 占い方式 | おみくじ / タロット / 九星気学 / 四柱推命 |
| AI | OpenAI / Anthropic（モデルは `.env` で変更可） |
| データ保存 | API キー → `localStorage` / プロフィール・履歴 → IndexedDB |
| デプロイ | 静的ホスティング（Vercel 等） |

詳細な構成図は [docs/architecture.md](docs/architecture.md)、画面遷移は [docs/screen-flow.md](docs/screen-flow.md) を参照。

### アーキテクチャ（概要）

```
ユーザーの端末
├── ブラウザ（Chrome / Safari）
│   ├── React PWA
│   ├── IndexedDB  ← 占い履歴・プロフィール
│   └── localStorage ← API キー
└── HTTPS（直接）
    ├── api.openai.com
    └── api.anthropic.com

ホスティング（Vercel 等）
└── 静的ファイルのみ（HTML + JS + CSS）
    ※ DB・認証・ログなし
```

Mermaid 版: [docs/architecture.md](docs/architecture.md)

---

## リポジトリ構成

各トップレベルフォルダは **100 ファイル未満**（ローカル専用ファイルは [`do-not-upload/`](do-not-upload/README.md) に集約 · Git 非対象）。

```
skills-6/
├── uranai-pwa/          ★ メイン — 本番用 PWA
├── do-not-upload/       ローカル専用（dist · node_modules 退避 · 大容量動画）
├── docs/                図解ドキュメント（アーキテクチャ・画面フロー）
├── scripts/             stash-for-upload.sh 等
├── skills/              デモ動画生成（make_demo.py）
└── archive/             アーカイブ（Expo 版スケルトン · 非メンテ）
    └── uranai-app/
```

---

## クイックスタート

```bash
cd uranai-pwa
npm install
cp .env.example .env.local   # 任意: AI モデル ID を変更
npm run assets               # 初回: PWA アイコン生成（Python 3 + Pillow）
npm run dev                  # http://localhost:5173
```

本番ビルド:

```bash
npm run build     # → do-not-upload/uranai-pwa/dist/
npm run preview   # 同上をプレビュー
```

ビルド成果物と `node_modules` は [`do-not-upload/`](do-not-upload/README.md) に集約（Git 非対象）。プッシュ前に `./scripts/stash-for-upload.sh` で退避できます。

詳細なデプロイ・販売手順は [`uranai-pwa/RUNBOOK.md`](uranai-pwa/RUNBOOK.md) を参照。今後の改善候補は [docs/roadmap.md](docs/roadmap.md)。

---

## 画面フロー

```
Welcome → API キー設定 → プロフィール → Home
                                           ├→ Ask →（AI 生成）→ Reveal
                                           ├→ History
                                           └→ Settings
```

図解: [docs/screen-flow.md](docs/screen-flow.md)

ルーティングは `HashRouter`（`/#/home` 形式）。オフライン対応 PWA として `vite-plugin-pwa` + Workbox を使用。

---

## プライバシー

- 開発者のサーバーには **ユーザーデータは一切送信されない**
- API キーは端末の `localStorage` にのみ保存（AI プロバイダーへは直接送信）
- 占い履歴は端末の IndexedDB にのみ保存

> 占い結果はエンターテインメント目的です。医療・法律・金融アドバイスではありません。

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| UI | React 18, インライン CSS |
| ビルド | Vite 5, TypeScript 5 |
| PWA | vite-plugin-pwa, Workbox |
| 永続化 | idb（IndexedDB）, localStorage |
| AI | OpenAI Chat Completions / Anthropic Messages API |

---

## ライセンス

[MIT](LICENSE)

---

<a id="english"></a>

# Oracle System — English

<p align="center">
  <a href="#神託システム--oracle-system">日本語</a> · <strong>English</strong>
</p>

A **cyberpunk-themed AI fortune-telling PWA** for Japanese users. API keys and fortune history stay on the user's device; requests go **directly from the browser** to OpenAI or Anthropic. No backend required — fully client-side.

**Diagram docs:** [docs/](docs/README.md) (architecture · screen flow · roadmap)  
**Cursor Canvas:** local IDE artifact `Oracle System Overview` (not included in this repo)

---

## Overview

| Item | Details |
|------|---------|
| Main app | `uranai-pwa/` — React + Vite + TypeScript PWA |
| Fortune styles | Omikuji / Tarot / Kyusei astrology / Shichusuimei |
| AI providers | OpenAI / Anthropic (model IDs via `.env`) |
| Storage | API key → `localStorage` / profile & history → IndexedDB |
| Deployment | Static hosting (Vercel, etc.) |

See [docs/architecture.md](docs/architecture.md) and [docs/screen-flow.md](docs/screen-flow.md) for Mermaid diagrams.

### Architecture (summary)

```
User device → Browser PWA → localStorage + IndexedDB
           → HTTPS direct → OpenAI / Anthropic
Hosting → static files only (no backend)
```

---

## Repository layout

Each top-level folder stays **under 100 files**. Local artifacts go in [`do-not-upload/`](do-not-upload/README.md) (excluded from git).

```
skills-6/
├── uranai-pwa/     ★ Main production PWA
├── do-not-upload/  Local-only (dist, stashed node_modules, large media)
├── docs/           Diagram documentation
├── scripts/        stash-for-upload.sh, etc.
├── skills/         Demo video tooling
└── archive/        Unmaintained Expo skeleton
    └── uranai-app/
```

---

## Quick start

```bash
cd uranai-pwa
npm install
cp .env.example .env.local   # optional: change AI model IDs
npm run assets
npm run dev
```

Production: `npm run build` → `do-not-upload/uranai-pwa/dist/` · `npm run preview`

Local-only files live in [`do-not-upload/`](do-not-upload/README.md) (not in git). Optional: `./scripts/stash-for-upload.sh` before push.

Ops guide: [`uranai-pwa/RUNBOOK.md`](uranai-pwa/RUNBOOK.md) · Improvements: [docs/roadmap.md](docs/roadmap.md)

---

## Screen flow

`Welcome → API key → Profile → Home → Ask → Reveal` · plus History & Settings

Diagram: [docs/screen-flow.md](docs/screen-flow.md) · HashRouter (`/#/home`) · PWA via Workbox

---

## Privacy

- **No user data** on the developer's server
- API keys in device `localStorage` (sent directly to AI providers when divining)
- Fortune history in IndexedDB on device only

> Entertainment only — not medical, legal, or financial advice.

---

## Tech stack

React 18 · Vite 5 · TypeScript 5 · vite-plugin-pwa · idb · OpenAI / Anthropic APIs

---

## License

[MIT](LICENSE)
