import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database Types ───────────────────────────────────────────────────────────

export interface DbSubject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
  question_count?: number;
}

export interface DbDocument {
  id: string;
  subject_id: string;
  user_id: string;
  name: string;
  file_path: string;
  extracted_text: string | null;
  status: "processing" | "done" | "error";
  error_message: string | null;
  created_at: string;
}

export interface DbQuestion {
  id: string;
  subject_id: string;
  document_id: string | null;
  text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: "상" | "중" | "하";
  topic: string | null;
  generation: number;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** 현재 로그인 사용자의 과목 목록 (문제 수 포함) */
export async function fetchUserSubjects(): Promise<DbSubject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select(`*, question_count:questions(count)`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...row,
    question_count: (row.question_count as unknown as { count: number }[])[0]?.count ?? 0,
  }));
}

/** 과목의 문제 목록 로드 */
export async function fetchQuestions(subjectId: string): Promise<DbQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DbQuestion[];
}
