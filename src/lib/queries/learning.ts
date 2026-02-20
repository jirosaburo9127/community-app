import { createClient } from "@/lib/supabase/server";

export async function getCourses(difficulty?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("*, profiles(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch courses:", error.message);
    return [];
  }
  return data;
}

export async function getCourse(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getLessons(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch lessons:", error.message);
    return [];
  }
  return data;
}

export async function getLesson(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getEnrollment(courseId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getLessonCompletions(courseId: string, userId: string) {
  const supabase = await createClient();

  // Get lesson IDs for this course
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (!lessons || lessons.length === 0) return [];

  const lessonIds = lessons.map((l) => l.id);
  const { data, error } = await supabase
    .from("lesson_completions")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);

  if (error) return [];
  return data;
}

export async function getMyEnrolledCourses(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("*, courses(*, profiles(*))")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) return [];
  return data;
}
