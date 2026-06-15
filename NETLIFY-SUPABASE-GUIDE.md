# Supabase × Netlify 本格Webアプリ 移行セットアップガイド

本アプリケーション（React & Vite 現場工程ホワイトボード）を **Netlify （フロントエンド静的ホスティング）** と **Supabase （強力なクラウドドキュメント・PostgreSQLデータベース）**を使って本番公開用のWebアプリにするための手順ガイドです。

---

## 📂 事前準備
AI Studioの左上・または設定メニューからソースコードをZIPダウンロードするか、または GitHub 連携してリポジトリを作成してください。

---

## 1. Supabase データベースの設定 (supabase.com)

1. **プロジェクト作成:**
   * [supabase.com](https://supabase.com/) にサインインし、新しいプロジェクト（GCPまたはAWSの日本リージョンを選択）を作成します。

2. **テーブルスキーマの作成:**
   * Supabaseダッシュボードの左メニューから **SQL Editor** を開きます。
   * **New Query** をクリックします。
   * プロジェクトのルートにある `supabase-schema.sql` の内容をコピー＆ペーストし、**RUN** ボタンを押します。
   * これにより、`members`、`tasks`、`update_logs` の各テーブルとセキュリティポリシー(RLS)が自動生成されます。

3. **APIキーとURLの取得:**
   * 左下の⚙️（Project Settings）から **API** 項目を開きます。
   * 以下の2つの値をコピーして安全に保管します：
     * **Project URL** (例: `https://xxxxxx.supabase.co`)
     * **Project API key (anon / public)** (例: `eyJhbGci...`)

---

## 2. フロントエンドコードのクライアント移行 (Netlify用)

現在アプリはローカルの `server.ts` を通じたAPI通信を行っています。Netlifyなどの静的ホスティングで動作させるために、クライアントサイドから直接 Supabase へ同期するシンプルな連携ファイルを参考までに残します。

### ⚡依存パッケージの追加
ローカルのプロジェクトディレクトリで以下コマンドを入力して Supabase SDK を追加します：
```bash
npm install @supabase/supabase-js
```

### ⚡Supabase クライアント設定の書き方（例: `src/lib/supabaseClient.ts`）
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### ⚡データの読み込み＆書き込み（`src/App.tsx` での置き換えイメージ）
これまで `/api/tasks` などに `fetch` していた処理を、以下のように変更するだけでサーバー側が不要になります。

* **取得の場合:**
  ```typescript
  const { data: tasks } = await supabase.from('tasks').select('*').order('order', { ascending: true });
  ```
* **作成の場合:**
  ```typescript
  await supabase.from('tasks').insert([ { title, category, start_date: startDate, ... } ]);
  ```
* **削除の場合:**
  ```typescript
  await supabase.from('tasks').delete().eq('id', taskId);
  ```

---

## 3. Netlify へのデプロイ設定 (app.netlify.com)

Netlifyは `dist` フォルダの静的ファイルを世界最高速のスピードで配信します。

### 📦 1. 静的ルーティング用設定ファイルの追加
React の Single Page Application (SPA) ルーティングを正常に機能させるため、`public/_redirects` ファイルを作成し、以下を記述します。
* **作成パス:** `/public/_redirects`
* **書き込む内容:**
  ```text
  /*    /index.html   200
  ```

### ⚙️ 2. Netlify 上でのビルド設定
Netlify ダッシュボードで GitHub リポジトリを連携する際、以下のように設定します。

* **Build Command:** `npm run build`
* **Publish directory:** `dist`

### 🔑 3. 環境変数の追加
Netlify の「Site Configuration」 -> 「Environment variables」にて、以下2つの変数を追加します。

* `VITE_SUPABASE_URL` = 取得した Supabase **Project URL**
* `VITE_SUPABASE_ANON_KEY` = 取得した Supabase **Project API key (anon)**

これだけで、ビルド時に安全に環境変数が埋め込まれ、Netlify URL（`https://xxx.netlify.app`）で世界中から安全・高速にアクセスできる最新の高性能Webアプリが完成します。
