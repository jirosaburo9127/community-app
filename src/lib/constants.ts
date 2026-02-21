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
  "startup-news":     { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
  "idea-consultation":{ bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
  "events":           { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
  "questions":        { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
  "projects":         { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
  "zatsudan":         { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
  "management":       { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" },
};

const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-800" };

export function getCategoryColor(slug: string | undefined) {
  return (slug && CATEGORY_COLORS[slug]) || DEFAULT_CATEGORY_COLOR;
}

export const POSTS_PER_PAGE = 12;

