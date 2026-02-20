export type ProfileRole = 'student' | 'entrepreneur' | 'mentor' | 'investor';

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  total_points: number;
  role: ProfileRole;
  company: string;
  skills: string[];
  twitter_url: string;
  linkedin_url: string;
  github_url: string;
  is_admin: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_emoji: string;
  sort_order: number;
};

export type Post = {
  id: string;
  author_id: string;
  category_id: number | null;
  title: string;
  body: string;
  image_urls: string[];
  is_pinned: boolean;
  comment_count: number;
  like_count: number;
  created_at: string;
  group_id: string | null;
  updated_at: string;
  // Joined fields
  profiles?: Profile;
  categories?: Category;
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  parent_id: string | null;
  created_at: string;
  profiles?: Profile;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  creator_id: string;
  status: 'open' | 'closed';
  created_at: string;
};

export type StartupStage = 'idea' | 'mvp' | 'seed' | 'series_a';

export type Startup = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string;
  stage: StartupStage;
  industry: string;
  website_url: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Profile;
  member_count?: number;
};

export type StartupMember = {
  id: string;
  startup_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: Profile;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string | null;
  location: string;
  capacity: number | null;
  image_url: string | null;
  organizer_id: string;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Profile;
  registration_count?: number;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  profiles?: Profile;
};

export type Group = {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar_url: string | null;
  creator_id: string;
  startup_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  member_count?: number;
  startups?: Startup;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: Profile;
};

export type Notification = {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'comment' | 'reaction';
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
  // Joined
  profiles?: Profile;
  posts?: { id: string; title: string };
};

export type Conversation = {
  id: string;
  participant1: string;
  participant2: string;
  last_message_at: string;
  created_at: string;
  // Joined
  other_user?: Profile;
  last_message?: string;
};

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  // Joined
  profiles?: Profile;
};

export type Invitation = {
  id: string;
  code: string;
  created_by: string | null;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  profiles?: Profile;
  used_profile?: Profile;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor_id: string;
  is_published: boolean;
  lesson_count: number;
  enrollment_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
};

export type CourseEnrollment = {
  id: string;
  course_id: string;
  user_id: string;
  completed_at: string | null;
  enrolled_at: string;
};

export type LessonCompletion = {
  id: string;
  lesson_id: string;
  user_id: string;
  completed_at: string;
};

export type GroupRoom = {
  id: string;
  group_id: string;
  name: string;
  description: string;
  creator_id: string;
  created_at: string;
};

export type RoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
};
