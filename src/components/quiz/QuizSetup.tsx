"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chapter, Difficulty, Subject } from "@/lib/mockData";
import {
  Layers,
  BarChart2,
  Hash,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

interface QuizSetupProps {
  subject: Subject;
  chapters: Chapter[];
  onStart: (config: QuizConfig) => void;
}

export interface QuizConfig {
  count: 10 | 30 | 50 | 100;
  difficulty: Difficulty | "전체";
  chapterIds: string[];
}

const COUNT_OPTIONS: Array<10 | 30 | 50 | 100> = [10, 30, 50, 100];
const DIFFICULTY_OPTIONS: Array<Difficulty | "전체"> = ["전체", "하", "중", "상"];

const difficultyLabel: Record<Difficulty | "전체", string> = {
  전체: "전체",
  하: "쉬움",
  중: "보통",
  상: "어려움",
};

const difficultyColor: Record<Difficulty | "전체", string> = {
  전체: "bg-muted text-muted-foreground",
  하: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  중: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  상: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function QuizSetup({ subject, chapters, onStart }: QuizSetupProps) {
  const [count, setCount] = useState<10 | 30 | 50 | 100>(10);
  const [difficulty, setDifficulty] = useState<Difficulty | "전체">("전체");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleChapter = (id: string) => {
    setSelectedChapters((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      onStart({
        count,
        difficulty,
        chapterIds: selectedChapters,
      });
    }, 2200);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-950">
          <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">AI 문제 생성</span>
        </div>
        <h2 className="text-2xl font-bold">
          {subject.icon} {subject.name}
        </h2>
        <p className="text-sm text-muted-foreground">문제 설정을 선택하고 시작하세요</p>
      </div>

      {/* Count */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">문제 수</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`rounded-lg border-2 py-3 text-sm font-semibold transition-all
                  ${count === n
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground"
                  }`}
              >
                {n}문제
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">난이도</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-lg border-2 py-3 text-sm font-semibold transition-all
                  ${difficulty === d
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground"
                  }`}
              >
                {difficultyLabel[d]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter filter */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">챕터 선택</span>
              <span className="text-xs text-muted-foreground">(선택 안 하면 전체)</span>
            </div>
            {selectedChapters.length > 0 && (
              <button
                onClick={() => setSelectedChapters([])}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                전체 해제
              </button>
            )}
          </div>

          <div className="space-y-2">
            {chapters.map((ch) => {
              const selected = selectedChapters.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  onClick={() => toggleChapter(ch.id)}
                  className={`w-full flex items-center justify-between rounded-lg border-2 px-3 py-2.5 text-left transition-all
                    ${selected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-border hover:border-muted-foreground/40"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
                        ${selected ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {ch.number}
                    </span>
                    <span className={`text-sm font-medium ${selected ? "text-blue-700 dark:text-blue-300" : ""}`}>
                      {ch.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 font-medium
                        ${ch.correctRate >= 70
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : ch.correctRate >= 50
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                    >
                      정답률 {ch.correctRate}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button
        onClick={handleStart}
        disabled={loading}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            AI가 문제를 생성하고 있습니다...
          </>
        ) : (
          <>
            문제 생성 시작
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {loading && (
        <p className="text-center text-xs text-muted-foreground animate-pulse">
          선택한 PDF 자료를 분석해 {count}문제를 생성 중입니다
        </p>
      )}
    </div>
  );
}
