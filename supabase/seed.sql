-- ============================================================
-- デモ用シードデータ
-- Supabase SQL Editor で実行してください
-- 再実行可能（既存のシードデータを削除してから再挿入）
-- ============================================================

BEGIN;

-- ============================================================
-- 0. クリーンアップ（再実行用）
-- ============================================================
-- デモユーザーIDリスト
DO $$
DECLARE
  demo_ids UUID[] := ARRAY[
    'aa000000-0000-4000-a000-000000000001',
    'aa000000-0000-4000-a000-000000000002',
    'aa000000-0000-4000-a000-000000000003',
    'aa000000-0000-4000-a000-000000000004',
    'aa000000-0000-4000-a000-000000000005',
    'aa000000-0000-4000-a000-000000000006',
    'aa000000-0000-4000-a000-000000000007',
    'aa000000-0000-4000-a000-000000000008'
  ];
BEGIN
  -- 依存テーブルを子→親の順で削除（テーブル存在チェック付き）
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='direct_messages') THEN
    DELETE FROM public.direct_messages WHERE sender_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='conversations') THEN
    DELETE FROM public.conversations WHERE participant1 = ANY(demo_ids) OR participant2 = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    DELETE FROM public.notifications WHERE user_id = ANY(demo_ids) OR actor_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='group_members') THEN
    DELETE FROM public.group_members WHERE user_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='groups') THEN
    DELETE FROM public.groups WHERE creator_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invitations') THEN
    DELETE FROM public.invitations WHERE created_by = ANY(demo_ids) OR used_by = ANY(demo_ids);
  END IF;
  -- これらは ON DELETE CASCADE があるが、明示的に削除して安全に
  DELETE FROM public.bookmarks WHERE user_id = ANY(demo_ids);
  DELETE FROM public.reactions WHERE user_id = ANY(demo_ids);
  DELETE FROM public.comments WHERE author_id = ANY(demo_ids);
  DELETE FROM public.posts WHERE author_id = ANY(demo_ids);
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='event_registrations') THEN
    DELETE FROM public.event_registrations WHERE user_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    DELETE FROM public.events WHERE organizer_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='challenge_members') THEN
    DELETE FROM public.challenge_members WHERE user_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='challenges') THEN
    DELETE FROM public.challenges WHERE creator_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='startup_members') THEN
    DELETE FROM public.startup_members WHERE user_id = ANY(demo_ids);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='startups') THEN
    DELETE FROM public.startups WHERE creator_id = ANY(demo_ids);
  END IF;
  -- 最後に auth.users を削除（profiles は CASCADE で自動削除）
  DELETE FROM auth.users WHERE id = ANY(demo_ids);
END $$;

-- ============================================================
-- 1. ダミーユーザー作成（auth.users → trigger で profiles 自動作成）
-- ============================================================
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000001', 'authenticated', 'authenticated', 'tanaka@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '90 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"田中太郎"}'::jsonb, now() - interval '90 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000002', 'authenticated', 'authenticated', 'sato@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '85 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"佐藤花子"}'::jsonb, now() - interval '85 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000003', 'authenticated', 'authenticated', 'yamada@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '80 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"山田健一"}'::jsonb, now() - interval '80 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000004', 'authenticated', 'authenticated', 'suzuki@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '75 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"鈴木美咲"}'::jsonb, now() - interval '75 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000005', 'authenticated', 'authenticated', 'takahashi@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '70 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"高橋誠"}'::jsonb, now() - interval '70 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000006', 'authenticated', 'authenticated', 'ito@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '65 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"伊藤さくら"}'::jsonb, now() - interval '65 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000007', 'authenticated', 'authenticated', 'watanabe@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '60 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"渡辺翔太"}'::jsonb, now() - interval '60 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa000000-0000-4000-a000-000000000008', 'authenticated', 'authenticated', 'nakamura@demo.test', crypt('demo1234', gen_salt('bf')), now() - interval '55 days', '{"provider":"email","providers":["email"]}'::jsonb, '{"display_name":"中村あかり"}'::jsonb, now() - interval '55 days', now(), '', '', '', '');

-- auth.identities（ログイン可能にするために必要）
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000001', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000001', 'email', 'tanaka@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000001', now(), now() - interval '90 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000002', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000002', 'email', 'sato@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000002', now(), now() - interval '85 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000003', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000003', 'email', 'yamada@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000003', now(), now() - interval '80 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000004', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000004', 'email', 'suzuki@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000004', now(), now() - interval '75 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000005', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000005', 'email', 'takahashi@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000005', now(), now() - interval '70 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000006', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000006', 'email', 'ito@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000006', now(), now() - interval '65 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000007', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000007', 'email', 'watanabe@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000007', now(), now() - interval '60 days', now()),
  (gen_random_uuid(), 'aa000000-0000-4000-a000-000000000008', jsonb_build_object('sub', 'aa000000-0000-4000-a000-000000000008', 'email', 'nakamura@demo.test'), 'email', 'aa000000-0000-4000-a000-000000000008', now(), now() - interval '55 days', now());

-- ============================================================
-- 2. プロフィール情報を更新
-- ============================================================
UPDATE public.profiles SET
  display_name = '田中太郎',
  bio = 'AI画像生成スタートアップ「ArtifyAI」創業者。元大手IT企業のMLエンジニア。画像生成AIの民主化を目指しています。',
  role = 'entrepreneur',
  company = 'ArtifyAI',
  skills = ARRAY['AI', 'Python', 'Machine Learning', 'ビジネス開発'],
  twitter_url = 'https://x.com/demo_tanaka',
  github_url = 'https://github.com/demo-tanaka'
WHERE id = 'aa000000-0000-4000-a000-000000000001';

UPDATE public.profiles SET
  display_name = '佐藤花子',
  bio = 'ABC Venturesパートナー。VC歴10年、アーリーステージのスタートアップ支援が専門。メンターとしてコミュニティに参加中。',
  role = 'mentor',
  company = 'ABC Ventures',
  skills = ARRAY['投資', '経営戦略', 'メンタリング', 'ファイナンス'],
  twitter_url = 'https://x.com/demo_sato',
  linkedin_url = 'https://linkedin.com/in/demo-sato'
WHERE id = 'aa000000-0000-4000-a000-000000000002';

UPDATE public.profiles SET
  display_name = '山田健一',
  bio = '工学部3年。Webアプリ開発が得意で、卒業後はスタートアップ立ち上げを目指しています。ハッカソン多数参加。',
  role = 'student',
  company = '',
  skills = ARRAY['React', 'TypeScript', 'Next.js', 'Node.js'],
  github_url = 'https://github.com/demo-yamada'
WHERE id = 'aa000000-0000-4000-a000-000000000003';

UPDATE public.profiles SET
  display_name = '鈴木美咲',
  bio = 'B2B SaaS「TaskFlow」の共同創業者 & CEO。チームの生産性を最大化するプロダクトを開発中。マーケティング畑出身。',
  role = 'entrepreneur',
  company = 'TaskFlow Inc.',
  skills = ARRAY['SaaS', 'マーケティング', 'Product Management', 'Growth'],
  twitter_url = 'https://x.com/demo_suzuki',
  linkedin_url = 'https://linkedin.com/in/demo-suzuki'
WHERE id = 'aa000000-0000-4000-a000-000000000004';

UPDATE public.profiles SET
  display_name = '高橋誠',
  bio = 'エンジェル投資家 / TH Capital代表。これまでに20社以上のスタートアップに投資。ものづくり系・DeepTech領域に注力。',
  role = 'investor',
  company = 'TH Capital',
  skills = ARRAY['投資', 'M&A', 'IPO支援', '事業開発'],
  linkedin_url = 'https://linkedin.com/in/demo-takahashi'
WHERE id = 'aa000000-0000-4000-a000-000000000005';

UPDATE public.profiles SET
  display_name = '伊藤さくら',
  bio = 'デザイン専攻の大学院生。UI/UXデザインとサービスデザインを研究中。ArtifyAIのデザインを担当しています。',
  role = 'student',
  company = '',
  skills = ARRAY['UI/UX', 'Figma', 'デザイン思考', 'ユーザーリサーチ'],
  twitter_url = 'https://x.com/demo_ito'
WHERE id = 'aa000000-0000-4000-a000-000000000006';

UPDATE public.profiles SET
  display_name = '渡辺翔太',
  bio = '農業 × テクノロジーで食の課題を解決したい。IoTセンサーとデータ分析で農業の効率化に挑戦中。元組み込みエンジニア。',
  role = 'entrepreneur',
  company = 'GreenSense',
  skills = ARRAY['IoT', 'ハードウェア', 'Arduino', 'Python', 'データ分析'],
  github_url = 'https://github.com/demo-watanabe'
WHERE id = 'aa000000-0000-4000-a000-000000000007';

UPDATE public.profiles SET
  display_name = '中村あかり',
  bio = 'シリアルアントレプレナー。過去に2社のExit経験あり。現在はコミュニティ運営に携わりながら、次世代起業家の育成に注力。',
  role = 'mentor',
  company = '',
  skills = ARRAY['起業', '組織マネジメント', 'ファイナンス', 'コーチング'],
  twitter_url = 'https://x.com/demo_nakamura',
  linkedin_url = 'https://linkedin.com/in/demo-nakamura'
WHERE id = 'aa000000-0000-4000-a000-000000000008';

-- ============================================================
-- 3. スタートアップ
-- ============================================================
INSERT INTO public.startups (id, name, slug, description, stage, industry, creator_id, created_at)
VALUES
  ('dd000000-0000-4000-a000-000000000001', 'ArtifyAI', 'artify-ai',
   'テキストや簡単なスケッチから高品質な画像を生成できるAIプラットフォーム。クリエイターのワークフローを革新し、誰でも簡単にプロレベルのビジュアルを作成できる世界を目指しています。',
   'mvp', 'AI / クリエイティブ',
   'aa000000-0000-4000-a000-000000000001', now() - interval '60 days'),
  ('dd000000-0000-4000-a000-000000000002', 'GreenSense', 'green-sense',
   '小規模農家でも手軽に導入できるIoTモニタリングシステム。温度・湿度・土壌水分をリアルタイムで計測し、最適な栽培環境をAIが提案します。',
   'idea', 'AgriTech',
   'aa000000-0000-4000-a000-000000000007', now() - interval '45 days');

-- スタートアップメンバー
INSERT INTO public.startup_members (startup_id, user_id, role, created_at)
VALUES
  ('dd000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001', 'founder', now() - interval '60 days'),
  ('dd000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000003', 'engineer', now() - interval '50 days'),
  ('dd000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000006', 'designer', now() - interval '48 days'),
  ('dd000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000007', 'founder', now() - interval '45 days');

-- ============================================================
-- 4. イベント
-- ============================================================
INSERT INTO public.events (id, title, description, event_date, end_date, location, capacity, organizer_id, created_at)
VALUES
  ('ee000000-0000-4000-a000-000000000001', '月例ピッチイベント Vol.8',
   '毎月恒例のピッチイベントです！各チーム5分のピッチ＋3分のQ&A。今回はAI・IoT関連のプロジェクトが多数登壇予定。観覧のみの参加も大歓迎です。軽食・ドリンクを用意しています。',
   now() + interval '14 days', now() + interval '14 days' + interval '3 hours',
   '3F イベントスペース', 30,
   'aa000000-0000-4000-a000-000000000002', now() - interval '20 days'),
  ('ee000000-0000-4000-a000-000000000002', 'ネットワーキングナイト 〜業界を超えた交流会〜',
   '起業家・投資家・学生が気軽に交流できるネットワーキングイベント。ピザとドリンクを楽しみながら、新しいつながりを作りましょう！自己紹介タイム、フリートークの2部構成です。',
   now() - interval '7 days', now() - interval '7 days' + interval '2 hours',
   '1F ラウンジ', 20,
   'aa000000-0000-4000-a000-000000000008', now() - interval '25 days');

-- イベント参加登録
INSERT INTO public.event_registrations (event_id, user_id, status, created_at)
VALUES
  -- ピッチイベント（今後）
  ('ee000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001', 'registered', now() - interval '18 days'),
  ('ee000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000003', 'registered', now() - interval '16 days'),
  ('ee000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000004', 'registered', now() - interval '15 days'),
  ('ee000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000006', 'registered', now() - interval '12 days'),
  ('ee000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000007', 'registered', now() - interval '10 days'),
  -- ネットワーキング（過去、attended）
  ('ee000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000001', 'attended', now() - interval '20 days'),
  ('ee000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000002', 'attended', now() - interval '20 days'),
  ('ee000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000003', 'attended', now() - interval '19 days'),
  ('ee000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000004', 'attended', now() - interval '18 days'),
  ('ee000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000005', 'attended', now() - interval '22 days'),
  ('ee000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000006', 'attended', now() - interval '21 days');

-- ============================================================
-- 5. チャレンジ
-- ============================================================
INSERT INTO public.challenges (id, title, description, category, difficulty, creator_id, status, created_at)
VALUES
  ('ff000000-0000-4000-a000-000000000001', '1週間でMVPを作ろう！',
   '7日間でアイデアをMVP（Minimum Viable Product）にするチャレンジです。技術スタックは自由。最終日にデモ発表会を行います。審査基準は「ユーザーの課題を解決できているか」です。',
   'プロダクト開発', 'beginner',
   'aa000000-0000-4000-a000-000000000001', 'open', now() - interval '30 days'),
  ('ff000000-0000-4000-a000-000000000002', 'ビジネスモデルキャンバスを完成させよう',
   'リーンキャンバスを使って自分のビジネスアイデアを整理するチャレンジ。メンターからのフィードバック付き。3日以内にキャンバスを完成させ、5分間のプレゼンテーションを準備してください。',
   'ビジネス戦略', 'intermediate',
   'aa000000-0000-4000-a000-000000000002', 'open', now() - interval '25 days');

-- チャレンジ参加者
INSERT INTO public.challenge_members (challenge_id, user_id, created_at)
VALUES
  ('ff000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000003', now() - interval '28 days'),
  ('ff000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000006', now() - interval '27 days'),
  ('ff000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000004', now() - interval '26 days'),
  ('ff000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000001', now() - interval '23 days'),
  ('ff000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000007', now() - interval '22 days');

-- ============================================================
-- 6. グループ（テーブルが存在する場合のみ）
-- ============================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups') THEN

INSERT INTO public.groups (id, name, slug, description, creator_id, startup_id, created_at)
VALUES
  ('ab000000-0000-4000-a000-000000000001', 'ArtifyAI掲示板', 'artify-ai-board',
   'ArtifyAIチームの掲示板です。開発状況や議論はこちらで。',
   'aa000000-0000-4000-a000-000000000001', 'dd000000-0000-4000-a000-000000000001',
   now() - interval '55 days'),
  ('ab000000-0000-4000-a000-000000000002', 'GreenSense掲示板', 'green-sense-board',
   'GreenSenseチームの掲示板です。農業IoTの開発やアイデアを共有しましょう。',
   'aa000000-0000-4000-a000-000000000007', 'dd000000-0000-4000-a000-000000000002',
   now() - interval '40 days');

INSERT INTO public.group_members (group_id, user_id, role, created_at)
VALUES
  ('ab000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001', 'admin', now() - interval '55 days'),
  ('ab000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000003', 'member', now() - interval '50 days'),
  ('ab000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000006', 'member', now() - interval '48 days'),
  ('ab000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000002', 'member', now() - interval '45 days'),
  ('ab000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000007', 'admin', now() - interval '40 days'),
  ('ab000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000005', 'member', now() - interval '35 days');

INSERT INTO public.posts (id, author_id, group_id, title, body, is_pinned, created_at, updated_at)
VALUES
  ('bb000000-0000-4000-a000-000000000101', 'aa000000-0000-4000-a000-000000000001',
   'ab000000-0000-4000-a000-000000000001',
   '今週のスプリント目標',
   'チームの皆さんお疲れ様です！今週のスプリント目標です。

- バッチ画像生成機能の実装（山田）
- 新しいUIデザインの適用（伊藤）
- API のレート制限機能追加（田中）

進捗があれば随時共有お願いします！',
   false, now() - interval '8 days', now() - interval '8 days'),

  ('bb000000-0000-4000-a000-000000000102', 'aa000000-0000-4000-a000-000000000003',
   'ab000000-0000-4000-a000-000000000001',
   'バッチ生成の実装方針について',
   '山田です。バッチ画像生成について技術的な方針を共有します。

実装案：
1. キュー方式（Bull + Redis）
2. 非同期バッチ処理（cron + DB ステータス管理）

個人的には案2のほうがインフラがシンプルで良いと思いますが、皆さんどう思いますか？',
   false, now() - interval '6 days', now() - interval '6 days'),

  ('bb000000-0000-4000-a000-000000000103', 'aa000000-0000-4000-a000-000000000007',
   'ab000000-0000-4000-a000-000000000002',
   'テスト農場の候補が見つかりました',
   '渡辺です。嬉しい報告です！

千葉県の農家さんからテスト運用の許可をいただきました。
- トマト栽培のビニールハウス（3棟）
- 来月から3ヶ月間の実証実験
- センサーを10台設置予定

高橋さん、進捗報告用の資料フォーマットは投資家向けにどういった形が良いですか？',
   false, now() - interval '5 days', now() - interval '5 days');

END IF;
END $$;

-- ============================================================
-- 7. 投稿（カテゴリID: 6=ニュース, 7=アイデア, 8=イベント, 9=質問, 10=プロジェクト, 2=雑談, 11=運営）
-- ============================================================
INSERT INTO public.posts (id, author_id, category_id, title, body, is_pinned, created_at, updated_at)
VALUES
  -- カテゴリ: スタートアップニュース
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001', 6,
   'AI画像生成サービス「ArtifyAI」ベータ版をリリースしました！',
   'こんにちは、田中です。

ついにArtifyAIのベータ版をリリースしました！🎉

テキストプロンプトや簡単なスケッチから、高品質な画像を生成できるサービスです。主な特徴：

- 日本語プロンプトに完全対応
- スケッチからの画像生成機能
- スタイル指定（アニメ、写真風、イラスト等）
- 商用利用可能なライセンス

現在ベータテスターを募集中です。興味のある方はお気軽にDMください！
フィードバックをいただけると大変助かります。

デモサイトも公開していますので、ぜひ触ってみてください。',
   false, now() - interval '40 days', now() - interval '40 days'),

  ('bb000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000007', 6,
   '農業IoTセンサーの試作品が完成しました',
   '渡辺です。GreenSenseの進捗報告です。

温度・湿度・土壌水分を計測できるセンサーモジュールの試作品がついに完成しました！

構成：
- ESP32マイコン
- 各種センサー（DHT22, 土壌水分センサー）
- ソーラーパネル駆動（電源不要）
- LoRaWAN通信で広範囲カバー

来月から実際の農場でテスト運用を開始します。ご興味のある農家さんとのつながりがあれば、ぜひご紹介ください。

コストは1台あたり部品代5,000円程度に抑えられそうです。',
   false, now() - interval '35 days', now() - interval '35 days'),

  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000004', 6,
   'TaskFlowが正式ローンチしました！',
   '鈴木です。お知らせです！

タスク管理SaaS「TaskFlow」を正式にリリースしました 🚀

チーム向けのタスク管理ツールで、以下の特徴があります：
- AIによるタスク自動分類・優先度提案
- Slack / Teams との双方向連携
- カンバン・ガントチャート・リスト表示の切替
- 日本語UIに完全対応

ベータ期間中にいただいたフィードバックを反映し、かなり使いやすくなったと思います。

現在、最初の3ヶ月は全プラン50%OFFキャンペーン中です。
ぜひ使ってみてください！',
   false, now() - interval '3 days', now() - interval '3 days'),

  -- カテゴリ: アイデア相談
  ('bb000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000003', 7,
   '飲食店向け予約管理アプリのアイデアについて',
   '山田です。卒業プロジェクトで考えているアイデアについて意見を聞かせてください。

**アイデア概要：**
小規模な飲食店（席数30以下）向けのLINE連携予約管理アプリ

**課題：**
- 既存の予約管理システムは大規模店舗向けが多く、月額料金が高い（月1万円〜）
- 小規模店はまだ電話や紙の予約帳で管理している
- 当日キャンセルや無断キャンセルの問題

**ソリューション：**
- LINE公式アカウントと連携した予約システム
- 月額2,980円の低価格
- リマインド自動送信でキャンセル率低下
- 顧客管理（来店回数、好みのメニュー等）

競合との差別化として「LINE連携」と「低価格」を軸にしたいのですが、どう思いますか？
特に飲食業界に詳しい方がいればアドバイスいただきたいです。',
   false, now() - interval '32 days', now() - interval '32 days'),

  ('bb000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000004', 7,
   'SaaSのプライシング戦略について相談です',
   '鈴木です。TaskFlowのプライシングモデルで悩んでいます。

現在検討しているのは2つのパターン：

**パターンA：フリーミアム**
- Free: 5名まで、基本機能
- Pro: ¥980/ユーザー/月、全機能
- Enterprise: 要見積もり

**パターンB：無料トライアル**
- 14日間全機能無料
- Standard: ¥780/ユーザー/月
- Pro: ¥1,480/ユーザー/月
- Enterprise: 要見積もり

ターゲットは10-50名規模のスタートアップ・中小企業です。

フリーミアムだと無料ユーザーのサポートコストが心配で、
無料トライアルだとコンバージョンまでの障壁が高そうで...

皆さんならどちらを選びますか？',
   false, now() - interval '28 days', now() - interval '28 days'),

  -- カテゴリ: イベント情報
  ('bb000000-0000-4000-a000-000000000005', 'aa000000-0000-4000-a000-000000000002', 8,
   '来月のピッチイベント Vol.8 のお知らせ',
   '佐藤です。毎月恒例のピッチイベントのお知らせです。

📅 日時：2週間後の金曜日 18:00〜21:00
📍 場所：3F イベントスペース
👥 定員：30名

**内容：**
各チーム5分のピッチ + 3分のQ&A形式です。
今回はAI・IoT関連のプロジェクトが多数登壇予定！

**発表者枠：あと2枠**
発表を希望される方はこの投稿にコメントしてください。

観覧のみの参加も大歓迎です。
軽食・ドリンクを用意しています🍕

イベント参加は「イベント」ページから登録お願いします。',
   true, now() - interval '25 days', now() - interval '25 days'),

  -- カテゴリ: 質問・相談
  ('bb000000-0000-4000-a000-000000000006', 'aa000000-0000-4000-a000-000000000006', 9,
   'UI/UXデザインツールのおすすめを教えてください',
   '伊藤です。デザインツールについて相談させてください。

現在Figmaを主に使っていますが、以下の用途で他のツールも試してみたいです：

1. **プロトタイピング** - インタラクティブなデモを素早く作りたい
2. **ユーザーテスト** - リモートでのユーザビリティテスト
3. **デザインシステム管理** - コンポーネント管理をもっと効率化したい

特に1のプロトタイピングツールでおすすめがあれば教えてください。
ProtoPie、Framer、Principle あたりが気になっています。

実際に使ったことがある方、使用感を教えていただけると嬉しいです！',
   false, now() - interval '22 days', now() - interval '22 days'),

  ('bb000000-0000-4000-a000-000000000007', 'aa000000-0000-4000-a000-000000000003', 9,
   '初めての資金調達で気をつけるべきことは？',
   '山田です。卒業後にスタートアップを考えています。

シード期の資金調達について、経験者の方に質問です。

- エンジェル投資家とVCの違いは実感としてどうですか？
- バリュエーションはどう決めましたか？
- 投資家との出会いのきっかけは？
- 資金調達にかかった期間は？
- 「これだけは準備しておけ」というものがあれば

まだアイデア段階ですが、将来的に資金調達が必要になると思うので、
今のうちに心構えをしておきたいです。

先輩起業家の皆さん、アドバイスいただけると嬉しいです。',
   false, now() - interval '18 days', now() - interval '18 days'),

  -- カテゴリ: プロジェクト紹介
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000001', 10,
   '【プロジェクト紹介】ArtifyAI - AI画像生成プラットフォーム',
   '改めてArtifyAIのプロジェクト紹介です。

## ミッション
「クリエイティブの民主化」- 誰もがプロレベルのビジュアルを作れる世界に。

## プロダクト概要
- テキスト・スケッチから画像生成
- 独自のファインチューニングモデル
- API提供（開発者向け）

## 技術スタック
- Backend: Python / FastAPI
- AI: PyTorch, Diffusers
- Frontend: Next.js / TypeScript
- Infra: AWS (EC2 GPU instances)

## チーム
- 田中太郎（CEO / MLエンジニア）
- 山田健一（フロントエンド）
- 伊藤さくら（UI/UXデザイン）

## 現在のステータス
- ベータ版公開中
- ユーザー数: 約80名
- 月次成長率: 30%

メンバー・アドバイザー募集中です！特にバックエンドエンジニアを探しています。',
   false, now() - interval '15 days', now() - interval '15 days'),

  ('bb000000-0000-4000-a000-000000000009', 'aa000000-0000-4000-a000-000000000007', 10,
   '【プロジェクト紹介】GreenSense - 農業向けIoTモニタリング',
   'GreenSenseのプロジェクト紹介です。

## 解決したい課題
日本の農業従事者の平均年齢は67歳。高齢化による担い手不足が深刻です。
経験と勘に頼る農業から、データドリブンな農業への転換が必要です。

## ソリューション
低コストのIoTセンサーで農場をモニタリングし、AIが最適な栽培アドバイスを提供。

## 特徴
- センサー1台5,000円の低コスト
- ソーラー駆動で電源不要
- LoRaWAN通信で広範囲対応
- スマホアプリでどこでも確認
- AIによる異常検知・栽培アドバイス

## 現在のステータス
- 試作品完成
- 来月からテスト農場で実証実験開始
- 農林水産省の補助金申請中

ハードウェアエンジニア、農業に詳しい方を募集中です。',
   false, now() - interval '12 days', now() - interval '12 days'),

  -- カテゴリ: 雑談
  ('bb000000-0000-4000-a000-000000000010', 'aa000000-0000-4000-a000-000000000006', 2,
   '今日のランチ会楽しかったです！',
   '初めてランチ会に参加しましたが、とても楽しかったです！

田中さんと山田さんとイタリアンに行きました。
パスタ美味しかった〜🍝

スタートアップの話から趣味の話まで、あっという間の1時間でした。
普段はデスクで作業していることが多いので、こういうリフレッシュの機会は大事ですね。

来月もぜひ参加したいです。
他の方も気軽に参加してください！',
   false, now() - interval '10 days', now() - interval '10 days'),

  ('bb000000-0000-4000-a000-000000000011', 'aa000000-0000-4000-a000-000000000005', 2,
   'おすすめのスタートアップ本を共有します',
   '最近読んで良かった本を何冊か紹介します。

📚 **定番だけど外せない**
- 「リーン・スタートアップ」エリック・リース
- 「ゼロ・トゥ・ワン」ピーター・ティール

📚 **日本のスタートアップ事情**
- 「起業の科学」田所雅之
- 「起業のファイナンス」磯崎哲也

📚 **最近のおすすめ**
- 「HARD THINGS」ベン・ホロウィッツ
- 「Measure What Matters」ジョン・ドーア

特に「HARD THINGS」は起業のリアルが書かれていて、
メンタル面での準備になりました。

皆さんのおすすめもあれば教えてください！',
   false, now() - interval '7 days', now() - interval '7 days'),

  -- カテゴリ: 運営より
  ('bb000000-0000-4000-a000-000000000012', 'aa000000-0000-4000-a000-000000000008', 11,
   '2月の活動スケジュールと新メンバーのお知らせ',
   '中村です。運営からのお知らせです。

## 新メンバー紹介 🎉
今月から3名の新しいメンバーが参加されました！
- フィンテック領域で起業準備中の方
- 大手メーカー出身のデザイナーの方
- 医療AIの研究者の方
ぜひ交流してください。

## 今月のスケジュール
- **第2週**: ビジネスモデルレビュー会
- **第3週**: ピッチイベント Vol.8
- **第4週**: メンタリングセッション（個別）

## お知らせ
- 3F会議室の予約システムが新しくなりました
- コワーキングスペースの利用時間が22時まで延長されました
- 来月からオフィスアワー（毎週水曜14:00-16:00）を開始します

質問・要望はいつでもお気軽にどうぞ！',
   true, now() - interval '5 days', now() - interval '5 days');

-- ============================================================
-- 8. コメント（トリガーで comment_count と total_points 自動更新）
-- ============================================================
INSERT INTO public.comments (id, post_id, author_id, body, parent_id, created_at)
VALUES
  -- p01（ArtifyAIベータ版）へのコメント
  ('cc000000-0000-4000-a000-000000000001', 'bb000000-0000-4000-a000-000000000001',
   'aa000000-0000-4000-a000-000000000002',
   '素晴らしいですね！ベータテスト参加したいです。日本語プロンプト対応は他にあまりないので差別化になりそう。',
   NULL, now() - interval '39 days'),

  ('cc000000-0000-4000-a000-000000000002', 'bb000000-0000-4000-a000-000000000001',
   'aa000000-0000-4000-a000-000000000005',
   'どのくらいのユーザー数を目標にしていますか？マネタイズの計画も聞きたいです。',
   NULL, now() - interval '39 days'),

  ('cc000000-0000-4000-a000-000000000003', 'bb000000-0000-4000-a000-000000000001',
   'aa000000-0000-4000-a000-000000000001',
   'ありがとうございます！まずは100名のベータユーザーを目標にしています。マネタイズはAPI従量課金 + サブスクリプションを考えています。',
   'cc000000-0000-4000-a000-000000000002', now() - interval '38 days'),

  -- p03（飲食店予約アプリ）へのコメント
  ('cc000000-0000-4000-a000-000000000004', 'bb000000-0000-4000-a000-000000000003',
   'aa000000-0000-4000-a000-000000000002',
   '面白いアイデアですね！LINE連携は日本市場では大きな差別化ポイントになると思います。月額2,980円という価格設定も小規模店にとって手が出しやすい。',
   NULL, now() - interval '31 days'),

  ('cc000000-0000-4000-a000-000000000005', 'bb000000-0000-4000-a000-000000000003',
   'aa000000-0000-4000-a000-000000000004',
   '競合調査はどのくらい進んでいますか？Airレジやトレタとの違いを明確にできると良いですね。',
   NULL, now() - interval '31 days'),

  ('cc000000-0000-4000-a000-000000000006', 'bb000000-0000-4000-a000-000000000003',
   'aa000000-0000-4000-a000-000000000003',
   'ありがとうございます！Airレジは高機能すぎて小規模店には操作が複雑なんです。「LINEだけで完結する」シンプルさを売りにしたいと思っています。',
   'cc000000-0000-4000-a000-000000000005', now() - interval '30 days'),

  -- p04（SaaSプライシング）へのコメント
  ('cc000000-0000-4000-a000-000000000007', 'bb000000-0000-4000-a000-000000000004',
   'aa000000-0000-4000-a000-000000000002',
   'プロダクトの性質によりますが、B2B SaaSならフリーミアムが効果的なことが多いです。ただし、無料ユーザーのサポートコストを甘く見ないことが大事です。',
   NULL, now() - interval '27 days'),

  ('cc000000-0000-4000-a000-000000000008', 'bb000000-0000-4000-a000-000000000004',
   'aa000000-0000-4000-a000-000000000005',
   '投資家目線では、無料トライアル14日間→有料のほうがコンバージョン率は高い傾向です。PLG（Product-Led Growth）の事例も参考にしてみてください。',
   NULL, now() - interval '27 days'),

  -- p05（ピッチイベント）へのコメント
  ('cc000000-0000-4000-a000-000000000009', 'bb000000-0000-4000-a000-000000000005',
   'aa000000-0000-4000-a000-000000000001',
   '発表枠、エントリーします！ArtifyAIの最新アップデートを紹介させてください。',
   NULL, now() - interval '24 days'),

  ('cc000000-0000-4000-a000-000000000010', 'bb000000-0000-4000-a000-000000000005',
   'aa000000-0000-4000-a000-000000000007',
   'GreenSenseの進捗も発表できればと思います。試作品のデモもやりたいです！',
   NULL, now() - interval '24 days'),

  -- p06（デザインツール）へのコメント
  ('cc000000-0000-4000-a000-000000000011', 'bb000000-0000-4000-a000-000000000006',
   'aa000000-0000-4000-a000-000000000003',
   'Framerがプロトタイピングには良いですよ！コードベースなので、実際の動きに近いプロトタイプが作れます。',
   NULL, now() - interval '21 days'),

  ('cc000000-0000-4000-a000-000000000012', 'bb000000-0000-4000-a000-000000000006',
   'aa000000-0000-4000-a000-000000000001',
   'ArtifyAIの開発でProtoPieを使っていますが、マイクロインタラクションの表現力が高くておすすめです。',
   NULL, now() - interval '21 days'),

  ('cc000000-0000-4000-a000-000000000013', 'bb000000-0000-4000-a000-000000000006',
   'aa000000-0000-4000-a000-000000000004',
   '最近はFigma自体のプロトタイプ機能もかなり充実してきましたよ。Advanced Prototypingで変数も使えるようになったので、まずはFigma内で完結させるのも手です。',
   NULL, now() - interval '20 days'),

  -- p07（資金調達）へのコメント
  ('cc000000-0000-4000-a000-000000000014', 'bb000000-0000-4000-a000-000000000007',
   'aa000000-0000-4000-a000-000000000002',
   'まずはピッチ資料をしっかり作ることが大事です。数字で語れるようにしましょう。特にTAM/SAM/SOMと、なぜ今このタイミングなのか（Why Now）が重要です。',
   NULL, now() - interval '17 days'),

  ('cc000000-0000-4000-a000-000000000015', 'bb000000-0000-4000-a000-000000000007',
   'aa000000-0000-4000-a000-000000000005',
   'エンジェル投資家との繋がりがあればご紹介できますよ。まずは事業計画を見せてもらえれば、適切な方をマッチングします。DMください。',
   NULL, now() - interval '17 days'),

  ('cc000000-0000-4000-a000-000000000016', 'bb000000-0000-4000-a000-000000000007',
   'aa000000-0000-4000-a000-000000000008',
   'J-STARTUPの支援プログラムや、各自治体のアクセラレーターも検討してみてください。資金だけでなく、メンタリングやネットワーキングの機会も得られます。',
   NULL, now() - interval '16 days'),

  -- p10（ランチ会）へのコメント
  ('cc000000-0000-4000-a000-000000000017', 'bb000000-0000-4000-a000-000000000010',
   'aa000000-0000-4000-a000-000000000003',
   '楽しかったですね！次回はカレー屋さんに行きましょう。近くに美味しいお店見つけました。',
   NULL, now() - interval '9 days'),

  ('cc000000-0000-4000-a000-000000000018', 'bb000000-0000-4000-a000-000000000010',
   'aa000000-0000-4000-a000-000000000001',
   'ランチ会いいですね。毎週やりたい！今度は他のメンバーも誘いましょう。',
   NULL, now() - interval '9 days'),

  -- p11（おすすめ本）へのコメント
  ('cc000000-0000-4000-a000-000000000019', 'bb000000-0000-4000-a000-000000000011',
   'aa000000-0000-4000-a000-000000000008',
   '「ゼロ・トゥ・ワン」は名著ですよね。「HARD THINGS」と合わせて読むと、理想と現実の両方が見えてきます。',
   NULL, now() - interval '6 days'),

  ('cc000000-0000-4000-a000-000000000020', 'bb000000-0000-4000-a000-000000000011',
   'aa000000-0000-4000-a000-000000000003',
   '「起業の科学」は日本のスタートアップ環境に特化していて参考になりました。最初に読んでおけばよかったと思う本です。',
   NULL, now() - interval '6 days'),

  -- p12（運営より）へのコメント
  ('cc000000-0000-4000-a000-000000000021', 'bb000000-0000-4000-a000-000000000012',
   'aa000000-0000-4000-a000-000000000001',
   '新メンバーの方、よろしくお願いします！ぜひランチ会にも来てください。',
   NULL, now() - interval '4 days'),

  ('cc000000-0000-4000-a000-000000000022', 'bb000000-0000-4000-a000-000000000012',
   'aa000000-0000-4000-a000-000000000004',
   '利用時間延長は嬉しいです！今月もよろしくお願いします。',
   NULL, now() - interval '4 days'),

  -- p13（TaskFlowローンチ）へのコメント
  ('cc000000-0000-4000-a000-000000000023', 'bb000000-0000-4000-a000-000000000013',
   'aa000000-0000-4000-a000-000000000002',
   'ローンチおめでとうございます！ベータからかなり改善されましたね。うちのVCでも使ってみたいです。',
   NULL, now() - interval '2 days'),

  ('cc000000-0000-4000-a000-000000000024', 'bb000000-0000-4000-a000-000000000013',
   'aa000000-0000-4000-a000-000000000007',
   '早速使ってみます！GreenSenseチームのタスク管理に導入してみますね。フィードバック送ります。',
   NULL, now() - interval '2 days');

-- ============================================================
-- 9. リアクション（トリガーで total_points 自動更新）
-- ============================================================
INSERT INTO public.reactions (post_id, user_id, emoji, created_at)
VALUES
  -- p01: ArtifyAIベータ
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000002', '👍', now() - interval '39 days'),
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000003', '🔥', now() - interval '39 days'),
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000005', '👏', now() - interval '38 days'),
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000006', '❤️', now() - interval '38 days'),
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000008', '👍', now() - interval '37 days'),
  -- p02: GreenSenseセンサー
  ('bb000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000001', '👍', now() - interval '34 days'),
  ('bb000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000003', '👍', now() - interval '34 days'),
  ('bb000000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000005', '💡', now() - interval '33 days'),
  -- p03: 飲食店予約アプリ
  ('bb000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000002', '💡', now() - interval '31 days'),
  ('bb000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000004', '👍', now() - interval '31 days'),
  ('bb000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000008', '👍', now() - interval '30 days'),
  -- p04: SaaSプライシング
  ('bb000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000002', '👍', now() - interval '27 days'),
  ('bb000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000005', '👍', now() - interval '27 days'),
  ('bb000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000008', '💡', now() - interval '26 days'),
  -- p05: ピッチイベント
  ('bb000000-0000-4000-a000-000000000005', 'aa000000-0000-4000-a000-000000000001', '👍', now() - interval '24 days'),
  ('bb000000-0000-4000-a000-000000000005', 'aa000000-0000-4000-a000-000000000003', '👍', now() - interval '24 days'),
  ('bb000000-0000-4000-a000-000000000005', 'aa000000-0000-4000-a000-000000000004', '👍', now() - interval '23 days'),
  ('bb000000-0000-4000-a000-000000000005', 'aa000000-0000-4000-a000-000000000007', '👍', now() - interval '23 days'),
  -- p06: デザインツール
  ('bb000000-0000-4000-a000-000000000006', 'aa000000-0000-4000-a000-000000000003', '💡', now() - interval '21 days'),
  ('bb000000-0000-4000-a000-000000000006', 'aa000000-0000-4000-a000-000000000001', '👍', now() - interval '21 days'),
  -- p07: 資金調達
  ('bb000000-0000-4000-a000-000000000007', 'aa000000-0000-4000-a000-000000000002', '👍', now() - interval '17 days'),
  ('bb000000-0000-4000-a000-000000000007', 'aa000000-0000-4000-a000-000000000005', '👍', now() - interval '17 days'),
  ('bb000000-0000-4000-a000-000000000007', 'aa000000-0000-4000-a000-000000000008', '❤️', now() - interval '16 days'),
  -- p08: ArtifyAIプロジェクト紹介
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000002', '🔥', now() - interval '14 days'),
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000003', '👏', now() - interval '14 days'),
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000005', '👍', now() - interval '13 days'),
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000006', '❤️', now() - interval '13 days'),
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000007', '👍', now() - interval '12 days'),
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000008', '👏', now() - interval '12 days'),
  -- p09: GreenSenseプロジェクト紹介
  ('bb000000-0000-4000-a000-000000000009', 'aa000000-0000-4000-a000-000000000001', '👍', now() - interval '11 days'),
  ('bb000000-0000-4000-a000-000000000009', 'aa000000-0000-4000-a000-000000000003', '💡', now() - interval '11 days'),
  ('bb000000-0000-4000-a000-000000000009', 'aa000000-0000-4000-a000-000000000005', '👍', now() - interval '10 days'),
  ('bb000000-0000-4000-a000-000000000009', 'aa000000-0000-4000-a000-000000000008', '👍', now() - interval '10 days'),
  -- p10: ランチ会
  ('bb000000-0000-4000-a000-000000000010', 'aa000000-0000-4000-a000-000000000001', '❤️', now() - interval '9 days'),
  ('bb000000-0000-4000-a000-000000000010', 'aa000000-0000-4000-a000-000000000003', '👍', now() - interval '9 days'),
  ('bb000000-0000-4000-a000-000000000010', 'aa000000-0000-4000-a000-000000000007', '👍', now() - interval '9 days'),
  ('bb000000-0000-4000-a000-000000000010', 'aa000000-0000-4000-a000-000000000008', '👍', now() - interval '8 days'),
  -- p11: おすすめ本
  ('bb000000-0000-4000-a000-000000000011', 'aa000000-0000-4000-a000-000000000001', '👍', now() - interval '6 days'),
  ('bb000000-0000-4000-a000-000000000011', 'aa000000-0000-4000-a000-000000000002', '👍', now() - interval '6 days'),
  ('bb000000-0000-4000-a000-000000000011', 'aa000000-0000-4000-a000-000000000003', '👍', now() - interval '5 days'),
  ('bb000000-0000-4000-a000-000000000011', 'aa000000-0000-4000-a000-000000000006', '👍', now() - interval '5 days'),
  -- p12: 運営より
  ('bb000000-0000-4000-a000-000000000012', 'aa000000-0000-4000-a000-000000000001', '👍', now() - interval '4 days'),
  ('bb000000-0000-4000-a000-000000000012', 'aa000000-0000-4000-a000-000000000004', '👍', now() - interval '4 days'),
  ('bb000000-0000-4000-a000-000000000012', 'aa000000-0000-4000-a000-000000000006', '👍', now() - interval '3 days'),
  ('bb000000-0000-4000-a000-000000000012', 'aa000000-0000-4000-a000-000000000007', '👍', now() - interval '3 days'),
  -- p13: TaskFlowローンチ
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000001', '👏', now() - interval '2 days'),
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000002', '🔥', now() - interval '2 days'),
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000003', '👍', now() - interval '2 days'),
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000005', '👏', now() - interval '1 day'),
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000006', '👍', now() - interval '1 day'),
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000007', '👍', now() - interval '1 day'),
  ('bb000000-0000-4000-a000-000000000013', 'aa000000-0000-4000-a000-000000000008', '👍', now() - interval '1 day');

-- ============================================================
-- 10. ブックマーク
-- ============================================================
INSERT INTO public.bookmarks (post_id, user_id, created_at)
VALUES
  -- 山田（学生）が参考になる投稿をブックマーク
  ('bb000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000003', now() - interval '38 days'),
  ('bb000000-0000-4000-a000-000000000008', 'aa000000-0000-4000-a000-000000000003', now() - interval '14 days'),
  ('bb000000-0000-4000-a000-000000000011', 'aa000000-0000-4000-a000-000000000003', now() - interval '5 days'),
  ('bb000000-0000-4000-a000-000000000007', 'aa000000-0000-4000-a000-000000000003', now() - interval '17 days'),
  -- 伊藤（デザイナー）がデザイン関連をブックマーク
  ('bb000000-0000-4000-a000-000000000006', 'aa000000-0000-4000-a000-000000000006', now() - interval '21 days'),
  ('bb000000-0000-4000-a000-000000000010', 'aa000000-0000-4000-a000-000000000006', now() - interval '9 days'),
  -- 田中（起業家）がイベント・資金調達をブックマーク
  ('bb000000-0000-4000-a000-000000000005', 'aa000000-0000-4000-a000-000000000001', now() - interval '24 days'),
  ('bb000000-0000-4000-a000-000000000007', 'aa000000-0000-4000-a000-000000000001', now() - interval '17 days');

-- ============================================================
-- 11. 追加イベント
-- ============================================================
INSERT INTO public.events (id, title, description, event_date, end_date, location, capacity, organizer_id, created_at)
VALUES
  ('ee000000-0000-4000-a000-000000000003', 'メンタリングセッション 〜1on1相談会〜',
   'メンター・投資家との1on1メンタリングセッションです。

事前に質問・相談したい内容を準備してきてください。1枠30分、最大6名まで対応可能です。

対応メンター：
- 佐藤花子（VC・経営戦略）
- 中村あかり（シリアルアントレプレナー）
- 高橋誠（投資・事業開発）

予約は先着順です。お早めにどうぞ！',
   now() + interval '7 days', now() + interval '7 days' + interval '3 hours',
   '2F ミーティングルームA/B/C', 6,
   'aa000000-0000-4000-a000-000000000008', now() - interval '10 days'),

  ('ee000000-0000-4000-a000-000000000004', 'Incubation Hub ハッカソン 2025',
   '24時間で新しいプロダクトを作り上げるハッカソンイベント！

テーマ：「地域課題 × テクノロジー」

- チーム編成（2-4名）は当日行います
- 優勝チームには賞金10万円 + メンタリング3ヶ月
- 食事・ドリンク・仮眠スペース完備

スキルレベルは問いません。学生も起業家も大歓迎！
新しい仲間と一緒に何かを生み出しましょう。',
   now() + interval '30 days', now() + interval '31 days',
   '全フロア（3F メイン会場）', 40,
   'aa000000-0000-4000-a000-000000000001', now() - interval '5 days');

-- 追加イベントの参加登録
INSERT INTO public.event_registrations (event_id, user_id, status, created_at)
VALUES
  ('ee000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000001', 'registered', now() - interval '8 days'),
  ('ee000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000004', 'registered', now() - interval '7 days'),
  ('ee000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000007', 'registered', now() - interval '6 days'),
  ('ee000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000001', 'registered', now() - interval '4 days'),
  ('ee000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000003', 'registered', now() - interval '3 days'),
  ('ee000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000006', 'registered', now() - interval '3 days'),
  ('ee000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000007', 'registered', now() - interval '2 days');

-- ============================================================
-- 12. DM会話（テーブルが存在する場合のみ）
-- ============================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN

INSERT INTO public.conversations (id, participant1, participant2, last_message_at, created_at)
VALUES
  ('cc100000-0000-4000-a000-000000000001',
   'aa000000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000002',
   now() - interval '1 day', now() - interval '15 days'),
  ('cc100000-0000-4000-a000-000000000002',
   'aa000000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000005',
   now() - interval '3 days', now() - interval '12 days'),
  ('cc100000-0000-4000-a000-000000000003',
   'aa000000-0000-4000-a000-000000000004', 'aa000000-0000-4000-a000-000000000007',
   now() - interval '2 days', now() - interval '8 days');

INSERT INTO public.direct_messages (conversation_id, sender_id, body, is_read, created_at)
VALUES
  ('cc100000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001',
   '佐藤さん、先日のピッチイベントではありがとうございました！フィードバックがとても参考になりました。',
   true, now() - interval '15 days'),
  ('cc100000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000002',
   'こちらこそ！ArtifyAIの進捗は素晴らしいですね。プロダクトの方向性も明確で好印象でした。',
   true, now() - interval '14 days'),
  ('cc100000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001',
   'ありがとうございます。資金調達について相談したいのですが、今度お時間いただけますか？',
   true, now() - interval '10 days'),
  ('cc100000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000002',
   'もちろんです。来週のメンタリングセッションで時間を取りましょう。事業計画書があれば事前に送ってください。',
   true, now() - interval '9 days'),
  ('cc100000-0000-4000-a000-000000000001', 'aa000000-0000-4000-a000-000000000001',
   '了解です！準備して事前にお送りしますね。よろしくお願いします！',
   false, now() - interval '1 day'),
  ('cc100000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000003',
   '高橋さん、投稿で「エンジェル投資家を紹介できる」とのことでしたが、まだアイデア段階でも大丈夫でしょうか？',
   true, now() - interval '12 days'),
  ('cc100000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000005',
   'もちろん大丈夫ですよ。アイデア段階でも、チームの熱意とビジョンがしっかりしていれば投資家は興味を持ちます。',
   true, now() - interval '11 days'),
  ('cc100000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000003',
   'ありがとうございます！飲食店向けの予約管理アプリを考えています。まずはピッチ資料を作ってみます。',
   true, now() - interval '5 days'),
  ('cc100000-0000-4000-a000-000000000002', 'aa000000-0000-4000-a000-000000000005',
   'いいですね。できたら見せてください。ピッチイベントで発表するのも良い経験になりますよ。',
   false, now() - interval '3 days'),
  ('cc100000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000007',
   '鈴木さん、TaskFlowのローンチおめでとうございます！GreenSenseでも早速使わせていただいています。',
   true, now() - interval '8 days'),
  ('cc100000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000004',
   'ありがとうございます！使っていただけて嬉しいです。何かフィードバックがあればぜひ教えてください。',
   true, now() - interval '7 days'),
  ('cc100000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000007',
   'IoTデバイスからのデータ連携みたいな機能があったら、うちみたいなハードウェア系チームにはすごく助かります。API連携の予定はありますか？',
   true, now() - interval '4 days'),
  ('cc100000-0000-4000-a000-000000000003', 'aa000000-0000-4000-a000-000000000004',
   'まさにWebhook/API連携は次のロードマップに入っています！GreenSenseのユースケースを参考にさせてください。今度詳しく教えてもらえますか？',
   false, now() - interval '2 days');

END IF;
END $$;

-- ============================================================
-- 13. 追加のお知らせ投稿（ピン留め）
-- ============================================================
INSERT INTO public.posts (id, author_id, category_id, title, body, is_pinned, created_at, updated_at)
VALUES
  ('bb000000-0000-4000-a000-000000000014', 'aa000000-0000-4000-a000-000000000008', 11,
   'ハッカソン参加者募集中！テーマは「地域課題 × テクノロジー」',
   '中村です。大きなお知らせです！

## Incubation Hub ハッカソン 2025 開催決定！

24時間で新しいプロダクトを作り上げるハッカソンイベントを開催します。

**テーマ：「地域課題 × テクノロジー」**

### 概要
- 日時：来月開催予定
- 場所：全フロア（3F メイン会場）
- 定員：40名（10チーム想定）
- 賞金：優勝10万円 + メンタリング3ヶ月

### 参加条件
- スキルレベル不問！
- チーム編成は当日行います
- 1人での参加もOK

食事・ドリンク・仮眠スペースも完備しています。
イベントページから参加登録をお願いします！',
   true, now() - interval '2 days', now() - interval '2 days');

-- ============================================================
-- 14. 既存ユーザーの onboarding_completed を true に設定（カラムが存在する場合のみ）
-- ============================================================
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
  UPDATE public.profiles SET onboarding_completed = true
  WHERE id IN (
    'aa000000-0000-4000-a000-000000000001',
    'aa000000-0000-4000-a000-000000000002',
    'aa000000-0000-4000-a000-000000000003',
    'aa000000-0000-4000-a000-000000000004',
    'aa000000-0000-4000-a000-000000000005',
    'aa000000-0000-4000-a000-000000000006',
    'aa000000-0000-4000-a000-000000000007',
    'aa000000-0000-4000-a000-000000000008'
  );
END IF;
END $$;

COMMIT;

-- ============================================================
-- 完了メッセージ
-- ============================================================
-- 作成されたデモデータ：
-- ・ユーザー 8名（起業家3名、メンター2名、投資家1名、学生2名）
-- ・スタートアップ 2件（ArtifyAI, GreenSense）
-- ・グループ 2件（ArtifyAI掲示板, GreenSense掲示板）+ メンバー + グループ投稿3件
-- ・イベント 4件（今後3件、過去1件）
-- ・チャレンジ 2件
-- ・投稿 14件（+ グループ投稿3件）
-- ・コメント 24件
-- ・リアクション 51件
-- ・ブックマーク 8件
-- ・イベント参加登録 18件
-- ・チャレンジ参加 5件
-- ・DM会話 3組 + メッセージ13通
-- ・全ユーザー onboarding_completed = true
--
-- ※ポイントとコメント数はトリガーにより自動計算されます
-- ※再実行する場合はそのまま再度実行してください（先にクリーンアップされます）
