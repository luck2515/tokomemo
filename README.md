# Tokomemo (とこメモ)

**Tokomemo** は、個人やカップルが「行きたい場所」や「思い出の場所」を一元管理できるPWA（プログレッシブウェブアプリ）です。
AIによる入力補助や、パートナーとのリアルタイム共有機能により、記録の手間を減らしながら、大切な思い出を美しく残すことができます。

## 🚀 主な機能

*   **スポット管理**: 写真、タグ、ステータス（行きたい/行った）で場所を整理。
*   **AI自動補完**: URLを貼るだけで、Gemini AIが店名、営業時間、価格帯などを自動入力。
*   **ペアリング機能**: パートナーとコードを交換して、お互いの「共有」スポットを閲覧可能。
*   **訪問記録**: 同じ場所に何度も訪れた記録（ログ）を残せます。
*   **オフライン対応**: 電波の悪い場所でも閲覧可能（PWA対応）。

## 🛠 技術スタック

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **Backend**: Supabase (Auth, Database, Storage)
*   **AI**: Google Gemini API (`gemini-2.5-flash`)

## 🏁 開発環境のセットアップ

このプロジェクトを引き継ぎ、開発を開始するための手順です。

### 1. 環境変数の設定
プロジェクトルートに `.env` ファイルを作成（または環境設定機能を使用）し、以下の値を設定してください。

```env
# Supabase設定 (Project Settings > API で確認)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Gemini API設定 (AI Studioで取得)
API_KEY=your-gemini-api-key
```

### 2. データベースの準備 (Supabase)
Supabaseの **SQL Editor** で以下のSQLを実行し、テーブルと関数を作成してください。

#### 拡張機能とテーブル作成
```sql
-- UUID生成用
create extension if not exists "uuid-ossp";

-- 1. プロフィール (usersテーブルと連動)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  pairing_code text unique,
  partner_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Authenticated users can read all profiles" on profiles for select to authenticated using (true);

-- 2. スポット
create table spots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  status text check (status in ('want_to_go', 'visited', 'revisit')),
  scope text check (scope in ('personal', 'shared', 'both')),
  cover_photo_url text,
  is_pinned boolean default false,
  tags text[],
  memo text,
  url text,
  phone text,
  address text,
  opening_hours text[],
  price_min integer,
  price_max integer,
  payment_methods text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table spots enable row level security;
create policy "Users can crud own spots" on spots for all using (auth.uid() = user_id);
create policy "Users can view partner shared spots" on spots for select using (
  auth.uid() = user_id OR 
  (scope in ('shared', 'both') AND user_id in (select partner_id from profiles where id = auth.uid()))
);

-- 3. 訪問記録
create table visits (
  id uuid default uuid_generate_v4() primary key,
  spot_id uuid references spots on delete cascade not null,
  user_id uuid references auth.users not null,
  visited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rating integer,
  memo text,
  bill integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table visits enable row level security;
create policy "Users can crud own visits" on visits for all using (auth.uid() = user_id);
create policy "Users can view partner visits" on visits for select using (
  auth.uid() = user_id OR 
  exists (select 1 from spots where spots.id = visits.spot_id and (spots.user_id = auth.uid() OR (spots.scope in ('shared', 'both') AND spots.user_id in (select partner_id from profiles where id = auth.uid()))))
);

-- 4. 写真
create table photos (
  id uuid default uuid_generate_v4() primary key,
  url text not null,
  spot_id uuid references spots on delete cascade,
  visit_id uuid references visits on delete cascade,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table photos enable row level security;
create policy "Users can crud own photos" on photos for all using (auth.uid() = user_id);
create policy "Users can view related photos" on photos for select using (true);
```

#### 関数とトリガー (必須)
```sql
-- 新規登録時のプロフィール自動作成トリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, pairing_code)
  values (new.id, new.email, upper(substring(md5(random()::text) from 1 for 4) || '-' || substring(md5(random()::text) from 1 for 4)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- メールアドレス重複チェック用関数 (RPC)
create or replace function check_email_exists(email_input text)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  return exists (select 1 from auth.users where email = email_input);
end;
$$;
grant execute on function check_email_exists to anon;
grant execute on function check_email_exists to authenticated;
```

#### ストレージ設定
1. Supabase Dashboard > Storage に移動。
2. `photos` という名前の新しいバケットを作成（Public AccessをONにする）。
3. Policiesを追加:
   - SELECT: 誰でも可能 (Give users access to search...)
   - INSERT: 認証済みユーザーのみ (Give users access to insert...)
   - DELETE: 自分のファイルのみ (Policy定義が必要)

## 📂 ディレクトリ構造
詳細は `docs/steering/structure.md` を参照してください。

*   `App.tsx`: アプリケーションのメインロジック（状態管理、ルーティング）。
*   `screens/`: 各画面のコンポーネント。
*   `lib/supabase.ts`: Supabaseクライアントの初期化。

## 💡 開発のヒント
*   **ルーティング**: URLベースではなく `screen` ステートで管理しています。新しい画面を追加する場合は `types.ts` の `AppScreen` 型を更新してください。
*   **AI機能**: `screens/SpotForm.tsx` 内でGemini APIを呼び出しています。Google Search Groundingを使用しているため、常に最新のWEB情報を取得します。
*   **デプロイ**: VercelやCloudflare Pagesなどの静的ホスティングサービスにデプロイ可能です（環境変数の設定を忘れずに）。