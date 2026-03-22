"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import QuizSetup, { QuizConfig } from "@/components/quiz/QuizSetup";
import QuizSession, { QuestionResult } from "@/components/quiz/QuizSession";
import QuizResult from "@/components/quiz/QuizResult";
import {
  mockSubjects,
  mockChapters,
  mockQuestions,
  Question,
  Subject,
  Chapter,
} from "@/lib/mockData";
import { supabase, fetchQuestions, DbQuestion } from "@/lib/supabase";
import { BookOpen, ChevronLeft, Loader2 } from "lucide-react";

type QuizStep = "loading" | "setup" | "session" | "result";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function dbQuestionToQuestion(db: DbQuestion): Question {
  return {
    id: db.id,
    subjectId: db.subject_id,
    chapterId: db.topic ?? "general",
    text: db.text,
    options: db.options,
    correctIndex: db.correct_index,
    explanation: db.explanation,
    difficulty: db.difficulty,
  };
}

/** topic 필드를 가상 Chapter로 변환 */
function topicsToChapters(questions: Question[]): Chapter[] {
  const topicMap = new Map<string, number[]>();
  questions.forEach((q) => {
    if (!topicMap.has(q.chapterId)) topicMap.set(q.chapterId, []);
    topicMap.get(q.chapterId)!.push(1);
  });

  let num = 1;
  const chapters: Chapter[] = [];
  topicMap.forEach((_, topic) => {
    chapters.push({
      id: topic,
      subjectId: questions[0]?.subjectId ?? "",
      number: num++,
      title: topic,
      summary: "",
      keywords: [],
      examPoints: [],
      correctRate: 60,
    });
  });
  return chapters;
}

function generateQuestions(config: QuizConfig, pool: Question[]): Question[] {
  let filtered = [...pool];

  if (config.chapterIds.length > 0) {
    const byChapter = filtered.filter((q) => config.chapterIds.includes(q.chapterId));
    if (byChapter.length > 0) filtered = byChapter;
  }

  if (config.difficulty !== "전체") {
    const byDiff = filtered.filter((q) => q.difficulty === config.difficulty);
    if (byDiff.length > 0) filtered = byDiff;
  }

  // 셔플
  filtered.sort(() => Math.random() - 0.5);

  // 문제 수 맞추기 (부족하면 순환)
  const result: Question[] = [];
  while (result.length < config.count) {
    for (const q of filtered) {
      if (result.length >= config.count) break;
      result.push({ ...q, id: `${q.id}-${result.length}` });
    }
  }
  return result.slice(0, config.count);
}

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subject") ?? "cloud";

  const isDbSubject = UUID_RE.test(subjectId);

  const [step, setStep] = useState<QuizStep>("loading");
  const [subject, setSubject] = useState<Subject | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [config, setConfig] = useState<QuizConfig | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isDbSubject) {
        // DB에서 과목 + 문제 로드
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        const [subjectRes, questions] = await Promise.all([
          supabase.from("subjects").select("*").eq("id", subjectId).single(),
          fetchQuestions(subjectId),
        ]);

        if (subjectRes.error || !subjectRes.data) {
          router.push("/");
          return;
        }

        const db = subjectRes.data;
        const mappedQuestions = questions.map(dbQuestionToQuestion);

        setSubject({
          id: db.id,
          name: db.name,
          description: db.description,
          progress: 0,
          lastStudied: db.created_at,
          totalChapters: mappedQuestions.length,
          completedChapters: 0,
          color: db.color,
          icon: db.icon,
        });
        setAllQuestions(mappedQuestions);
        // DB 과목은 setup 없이 바로 session 시작
        setSessionQuestions([...mappedQuestions].sort(() => Math.random() - 0.5));
        setStep("session");
        return;
      } else {
        // Mock 데이터 사용
        const found = mockSubjects.find((s) => s.id === subjectId) ?? mockSubjects[0];
        setSubject(found);
        setAllQuestions(mockQuestions.filter((q) => q.subjectId === found.id));
        setChapters(mockChapters.filter((c) => c.subjectId === found.id));
      }
      setStep("setup");
    };
    load();
  }, [subjectId]);

  const handleStart = (cfg: QuizConfig) => {
    setConfig(cfg);
    setSessionQuestions(generateQuestions(cfg, allQuestions));
    setStep("session");
  };

  const handleFinish = (res: QuestionResult[]) => {
    setResults(res);
    setStep("result");
  };

  const handleRetry = () => {
    if (isDbSubject) {
      setSessionQuestions([...allQuestions].sort(() => Math.random() - 0.5));
      setResults([]);
      setStep("session");
    } else if (config) {
      setSessionQuestions(generateQuestions(config, allQuestions));
      setResults([]);
      setStep("session");
    } else {
      setStep("setup");
    }
  };

  if (step === "loading" || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            홈
          </Link>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-bold">ExamCraft</span>
            <span className="text-muted-foreground text-sm hidden sm:block">
              / {subject.icon} {subject.name}
            </span>
            {isDbSubject && (
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {allQuestions.length}문제
              </span>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {(isDbSubject ? ["session", "result"] : ["setup", "session", "result"] as const).map((s, i) => {
              const steps = isDbSubject ? ["session", "result"] : ["setup", "session", "result"];
              return (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === s
                      ? "w-6 bg-blue-500"
                      : i < steps.indexOf(step)
                      ? "w-2 bg-blue-300"
                      : "w-2 bg-muted"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {step === "setup" && (
          <QuizSetup subject={subject} chapters={chapters} onStart={handleStart} />
        )}
        {step === "session" && sessionQuestions.length > 0 && (
          <QuizSession questions={sessionQuestions} onFinish={handleFinish} />
        )}
        {step === "result" && (
          <QuizResult
            results={results}
            subject={subject}
            onRetry={handleRetry}
            onHome={() => router.push("/")}
          />
        )}
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <QuizPageInner />
    </Suspense>
  );
}
