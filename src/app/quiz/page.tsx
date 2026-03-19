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
} from "@/lib/mockData";
import { BookOpen, ChevronLeft } from "lucide-react";

type QuizStep = "setup" | "session" | "result";

function generateQuestions(config: QuizConfig, subjectId: string): Question[] {
  let pool = mockQuestions.filter((q) => q.subjectId === subjectId);

  if (config.chapterIds.length > 0) {
    pool = pool.filter((q) => config.chapterIds.includes(q.chapterId));
  }

  if (config.difficulty !== "전체") {
    const diffFiltered = pool.filter((q) => q.difficulty === config.difficulty);
    if (diffFiltered.length > 0) pool = diffFiltered;
  }

  if (pool.length === 0) pool = mockQuestions.filter((q) => q.subjectId === subjectId);

  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // If requested count > available, cycle through
  const result: Question[] = [];
  while (result.length < config.count) {
    for (const q of shuffled) {
      if (result.length >= config.count) break;
      // Clone with unique id to allow repeats
      result.push({ ...q, id: `${q.id}-${result.length}` });
    }
  }

  return result.slice(0, config.count);
}

function QuizPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subject") ?? "cloud";

  const subject = mockSubjects.find((s) => s.id === subjectId) ?? mockSubjects[0];
  const chapters = mockChapters.filter((c) => c.subjectId === subjectId);

  const [step, setStep] = useState<QuizStep>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [config, setConfig] = useState<QuizConfig | null>(null);

  const handleStart = (cfg: QuizConfig) => {
    const qs = generateQuestions(cfg, subjectId);
    setConfig(cfg);
    setQuestions(qs);
    setStep("session");
  };

  const handleFinish = (res: QuestionResult[]) => {
    setResults(res);
    setStep("result");
  };

  const handleRetry = () => {
    if (config) {
      const qs = generateQuestions(config, subjectId);
      setQuestions(qs);
      setResults([]);
      setStep("session");
    } else {
      setStep("setup");
    }
  };

  const handleHome = () => {
    router.push("/");
  };

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
            <span className="font-bold">ExamReady</span>
            <span className="text-muted-foreground text-sm hidden sm:block">
              / {subject.icon} {subject.name}
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {(["setup", "session", "result"] as QuizStep[]).map((s, i) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-6 bg-blue-500"
                    : i < ["setup", "session", "result"].indexOf(step)
                    ? "w-2 bg-blue-300"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {step === "setup" && (
          <QuizSetup subject={subject} chapters={chapters} onStart={handleStart} />
        )}
        {step === "session" && questions.length > 0 && (
          <QuizSession questions={questions} onFinish={handleFinish} />
        )}
        {step === "result" && (
          <QuizResult
            results={results}
            subject={subject}
            onRetry={handleRetry}
            onHome={handleHome}
          />
        )}
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense>
      <QuizPageInner />
    </Suspense>
  );
}
