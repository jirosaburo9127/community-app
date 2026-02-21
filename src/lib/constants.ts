export const POINT_VALUES = {
  POST_CREATED: 10,
  COMMENT_ADDED: 3,
  REACTION_RECEIVED: 1,
  LESSON_COMPLETED: 5,
  COURSE_COMPLETED: 20,
} as const;

export const CATEGORIES_SEED = [
  { name: "スタートアップニュース", slug: "startup-news", icon_emoji: "📰", sort_order: 1 },
  { name: "アイデア相談", slug: "idea-consultation", icon_emoji: "💡", sort_order: 2 },
  { name: "イベント情報", slug: "events", icon_emoji: "📅", sort_order: 3 },
  { name: "質問・相談", slug: "questions", icon_emoji: "❓", sort_order: 4 },
  { name: "プロジェクト紹介", slug: "projects", icon_emoji: "🚀", sort_order: 5 },
  { name: "雑談", slug: "zatsudan", icon_emoji: "💬", sort_order: 6 },
  { name: "運営より", slug: "management", icon_emoji: "📢", sort_order: 7 },
] as const;

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; gradient: string; tab: string }> = {
  "startup-news":     { bg: "bg-emerald-50",  text: "text-emerald-700",  gradient: "from-emerald-600 to-emerald-400", tab: "bg-emerald-600" },
  "idea-consultation":{ bg: "bg-amber-50",    text: "text-amber-700",    gradient: "from-amber-500 to-amber-400",   tab: "bg-amber-500" },
  "events":           { bg: "bg-teal-50",     text: "text-teal-700",     gradient: "from-teal-500 to-teal-400",     tab: "bg-teal-600" },
  "questions":        { bg: "bg-orange-50",   text: "text-orange-700",   gradient: "from-orange-500 to-orange-400", tab: "bg-orange-600" },
  "projects":         { bg: "bg-lime-50",     text: "text-lime-700",     gradient: "from-lime-500 to-lime-400",     tab: "bg-lime-600" },
  "zatsudan":         { bg: "bg-stone-100",   text: "text-stone-700",    gradient: "from-stone-500 to-stone-400",   tab: "bg-stone-500" },
  "management":       { bg: "bg-yellow-50",   text: "text-yellow-700",   gradient: "from-yellow-500 to-yellow-400", tab: "bg-yellow-600" },
};

const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-500" };

export function getCategoryColor(slug: string | undefined) {
  return (slug && CATEGORY_COLORS[slug]) || DEFAULT_CATEGORY_COLOR;
}

export const POSTS_PER_PAGE = 12;

