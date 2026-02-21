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
  "startup-news":     { bg: "bg-blue-50",    text: "text-blue-700",    gradient: "from-blue-500 to-blue-400",       tab: "bg-blue-600" },
  "idea-consultation":{ bg: "bg-amber-50",   text: "text-amber-700",   gradient: "from-amber-500 to-amber-400",     tab: "bg-amber-500" },
  "events":           { bg: "bg-emerald-50", text: "text-emerald-700", gradient: "from-emerald-500 to-emerald-400", tab: "bg-emerald-600" },
  "questions":        { bg: "bg-violet-50",  text: "text-violet-700",  gradient: "from-violet-500 to-violet-400",   tab: "bg-violet-600" },
  "projects":         { bg: "bg-rose-50",    text: "text-rose-700",    gradient: "from-rose-500 to-rose-400",       tab: "bg-rose-600" },
  "zatsudan":         { bg: "bg-sky-50",     text: "text-sky-700",     gradient: "from-sky-500 to-sky-400",         tab: "bg-sky-500" },
  "management":       { bg: "bg-orange-50",  text: "text-orange-700",  gradient: "from-orange-500 to-orange-400",   tab: "bg-orange-600" },
};

const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50", text: "text-gray-700", gradient: "from-gray-400 to-gray-300", tab: "bg-gray-500" };

export function getCategoryColor(slug: string | undefined) {
  return (slug && CATEGORY_COLORS[slug]) || DEFAULT_CATEGORY_COLOR;
}

export const POSTS_PER_PAGE = 12;

export const JOB_CATEGORIES = [
  { value: "engineer", label: "エンジニア", emoji: "💻" },
  { value: "designer", label: "デザイナー", emoji: "🎨" },
  { value: "marketer", label: "マーケター", emoji: "📈" },
  { value: "business", label: "ビジネス", emoji: "💼" },
  { value: "other", label: "その他", emoji: "🔧" },
] as const;

export const MENTORING_EXPERTISE_AREAS = [
  { value: "product", label: "プロダクト開発", emoji: "🛠️" },
  { value: "marketing", label: "マーケティング", emoji: "📣" },
  { value: "fundraising", label: "資金調達", emoji: "💰" },
  { value: "sales", label: "営業・セールス", emoji: "🤝" },
  { value: "design", label: "デザイン・UX", emoji: "🎨" },
  { value: "engineering", label: "エンジニアリング", emoji: "💻" },
  { value: "management", label: "組織・マネジメント", emoji: "👥" },
  { value: "legal", label: "法務・知財", emoji: "⚖️" },
  { value: "global", label: "海外展開", emoji: "🌏" },
  { value: "other", label: "その他", emoji: "📌" },
] as const;

export const RESOURCE_CATEGORIES = [
  { value: "template", label: "テンプレート", emoji: "📝" },
  { value: "pitch", label: "ピッチ資料", emoji: "📊" },
  { value: "tech_article", label: "技術記事", emoji: "💻" },
  { value: "tool", label: "ツール", emoji: "🔧" },
  { value: "book", label: "書籍", emoji: "📚" },
  { value: "other", label: "その他", emoji: "📌" },
] as const;
