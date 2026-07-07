# アーキテクチャ / Architecture

[← ドキュメント一覧](README.md) · [English section ↓](#english)

## システム構成

```mermaid
flowchart TB
  subgraph Device["ユーザーの端末 / User device"]
    PWA["React PWA<br/>(uranai-pwa)"]
    LS[("localStorage<br/>API キー")]
    IDB[("IndexedDB<br/>プロフィール・占い履歴")]
    PWA --> LS
    PWA --> IDB
  end

  subgraph CDN["静的ホスティング / Static host"]
    Static["HTML · JS · CSS<br/>(Vercel 等)"]
  end

  subgraph AI["AI プロバイダー / AI providers"]
    OpenAI["api.openai.com"]
    Anthropic["api.anthropic.com"]
  end

  User((User)) --> PWA
  PWA -->|"初回ロード"| Static
  PWA -->|"HTTPS 直接"| OpenAI
  PWA -->|"HTTPS 直接"| Anthropic
```

## レイヤー

| レイヤー | ディレクトリ | 役割 |
|----------|--------------|------|
| UI | `src/screens/` | 画面・ルーティング先 |
| 状態 | `src/hooks/` | 占い生成・プロフィール |
| AI | `src/ai/` | プロンプト組み立て・API 呼び出し |
| 永続化 | `src/db/` · `src/storage/` | IndexedDB · localStorage |
| PWA | `vite.config.ts` | Service Worker · マニフェスト |

## プライバシー境界

```mermaid
flowchart LR
  subgraph Never["開発者サーバーに送られない"]
    K[API キー]
    H[占い履歴]
    P[プロフィール]
  end

  subgraph Always["ユーザーブラウザから直接"]
    AI[OpenAI / Anthropic]
  end

  K --> AI
  H -.->|"プロンプトに要約"| AI
  P -.->|"プロンプトに含める"| AI
```

- 開発者の CDN には **アプリコードのみ** が置かれる
- 占いリクエストは Service Worker 上で `NetworkOnly`（キャッシュしない）

---

<a id="english"></a>

## English

### System layout

The PWA runs entirely in the browser. On first visit, static assets load from a CDN (e.g. Vercel). After setup, the user’s API key lives in `localStorage`; profile and fortune history live in IndexedDB. Fortune requests go **directly** from the browser to OpenAI or Anthropic — no app backend.

### Layers

| Layer | Path | Role |
|-------|------|------|
| UI | `src/screens/` | Screens & route targets |
| State | `src/hooks/` | Fortune generation & profile |
| AI | `src/ai/` | Prompts & API client |
| Storage | `src/db/` · `src/storage/` | IndexedDB · localStorage |
| PWA | `vite.config.ts` | Service worker & manifest |

### Privacy boundary

Data marked “never on developer server” stays on the device except when the user explicitly sends a fortune request to an AI provider. The developer only hosts read-only static files.
