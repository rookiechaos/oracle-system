# 改善ロードマップ / Improvement Roadmap

[← ドキュメント一覧](README.md)

## 完了済み / Done

- [x] Profile ルート分流（`/profile` vs `/settings/profile`）
- [x] Reveal 无效 ID 错误状态
- [x] AI モデル名を環境変数化（`.env.example`）
- [x] `saveProfile` で `createdAt` を保持
- [x] Settings / ApiKey のプライバシー文言修正
- [x] リポジトリ各フォルダ 100 ファイル未満 · `do-not-upload/` でローカル成果物を集約
- [x] History → Reveal（`?instant=1` 即時表示）
- [x] `uranai-app/` を `archive/` へ移動
- [x] ApiKey 编辑：预填、保存后回 Settings
- [x] `luckLevel` 解析・表示・おみくじフィルタ
- [x] 単条履歴削除
- [x] History 分页（cursor + さらに読み込む）
- [x] RouteGuard 闪烁修复
- [x] PWA `start_url: './'`
- [x] RUNBOOK 同步 · 移除 framer-motion · GitHub Actions CI
- [x] 占い履歴：おみくじフィルタ · 単条削除 · RUNBOOK ユーザーガイド
- [x] Welcome Matrix リサイズ対応 · `getAllFortunes()` 削除
- [x] npm audit: esbuild override（Vite 8 待ち）

## 推奨（次の一手）/ Recommended next

| 優先度 | 項目 | 理由 |
|--------|------|------|
| 中 | E2E テスト（Playwright） | オンボーディングフロー |
| 低 | Expo ネイティブ版を再開 | `archive/uranai-app` を参照 |
| 低 | 旧履歴の `luckLevel` DB 一括 backfill | 現状は表示時に re-parse で対応済み |

## デプロイ前チェック / Pre-release checklist

- [ ] `cd uranai-pwa && npm install && npm run build`
- [ ] 実 API キーで Anthropic / OpenAI 両方テスト
- [ ] iPhone Safari で「ホーム画面に追加」
- [ ] Gumroad 説明文と RUNBOOK の URL を一致させる
