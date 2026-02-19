-- ============================================================
-- BACKFILL: 既存データからポイントを一括計算
-- POST=10pt, COMMENT=3pt, REACTION(受信)=1pt
-- ============================================================
UPDATE public.profiles p
SET total_points = (
  SELECT COALESCE(SUM(pts), 0) FROM (
    -- 投稿: 10pt each
    SELECT COUNT(*) * 10 AS pts
    FROM public.posts
    WHERE author_id = p.id
    UNION ALL
    -- コメント: 3pt each
    SELECT COUNT(*) * 3 AS pts
    FROM public.comments
    WHERE author_id = p.id
    UNION ALL
    -- リアクション受信: 1pt each
    SELECT COUNT(*) * 1 AS pts
    FROM public.reactions r
    JOIN public.posts po ON po.id = r.post_id
    WHERE po.author_id = p.id
  ) sub
);
