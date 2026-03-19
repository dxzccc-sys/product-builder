"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionResult } from "./QuizSession";
import { Subject } from "@/lib/mockData";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Home,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
} from "lucide-react";

interface QuizResultProps {
  results: QuestionResult[];
  subject: Subject;
  onRetry: () => void;
  onHome: () => void;
}

const optionLabels = ["①", "②", "③", "④"];

function formatTime(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}초`;
  return `${Math.floor(s / 60)}분 ${s % 60}초`;
}

function getScoreEmoji(rate: number) {
  if (rate >= 90) return "🏆";
  if (rate >= 80) return "🥇";
  if (rate >= 70) return "🥈";
  if (rate >= 60) return "🥉";
  return "📚";
}

function getScoreMessage(rate: number) {
  if (rate >= 90) return "완벽합니다! 시험 준비 완료!";
  if (rate >= 80) return "훌륭해요! 조금만 더 다듬으면 됩니다";
  if (rate >= 70) return "좋아요! 틀린 문제 위주로 복습하세요";
  if (rate >= 60) return "아직 부족해요. 더 연습이 필요합니다";
  return "기초부터 다시 복습해 보세요!";
}

export default function QuizResult({ results, subject, onRetry, onHome }: QuizResultProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWrongOnly, setShowWrongOnly] = useState(false);

  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const rate = Math.round((correct / total) * 100);
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const avgTime = Math.round(totalTime / total / 1000);

  const displayed = showWrongOnly ? results.filter((r) => !r.isCorrect) : results;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Score card */}
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-8 text-center space-y-4">
        <div className="text-5xl">{getScoreEmoji(rate)}</div>
        <div>
          <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">{rate}점</div>
          <p className="text-muted-foreground mt-1 text-sm">{getScoreMessage(rate)}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xl font-bold">{correct}</span>
            </div>
            <span className="text-xs text-muted-foreground">정답</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-red-500">
              <XCircle className="h-4 w-4" />
              <span className="text-xl font-bold">{total - correct}</span>
            </div>
            <span className="text-xs text-muted-foreground">오답</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xl font-bold">{avgTime}초</span>
            </div>
            <span className="text-xs text-muted-foreground">평균 풀이시간</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="mx-auto max-w-xs space-y-1.5 pt-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0점</span>
            <span>100점</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/60 dark:bg-black/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                rate >= 70 ? "bg-blue-500" : rate >= 50 ? "bg-orange-500" : "bg-red-500"
              }`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onHome} className="flex-1 gap-2">
          <Home className="h-4 w-4" />
          홈으로
        </Button>
        <Button onClick={onRetry} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
          <RotateCcw className="h-4 w-4" />
          다시 풀기
        </Button>
      </div>

      {/* Review section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            문제 복습
          </h3>
          <button
            onClick={() => setShowWrongOnly((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors
              ${showWrongOnly
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            {showWrongOnly ? "전체 보기" : "오답만 보기"}
          </button>
        </div>

        {displayed.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">모든 문제를 맞혔습니다! 🎉</p>
          </div>
        )}

        {displayed.map((result, idx) => {
          const qIdx = results.indexOf(result);
          const isExpanded = expandedId === result.question.id;

          return (
            <Card
              key={result.question.id}
              className={`overflow-hidden border-l-4 ${
                result.isCorrect ? "border-l-green-400" : "border-l-red-400"
              }`}
            >
              <CardContent className="p-0">
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : result.question.id)}
                >
                  <div className="flex items-start gap-3">
                    {result.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Q{qIdx + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(result.timeSpent)}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{result.question.text}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t bg-muted/20 px-4 pb-4 pt-3 space-y-3">
                    {/* Options */}
                    <div className="space-y-1.5">
                      {result.question.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm
                            ${i === result.question.correctIndex
                              ? "bg-green-50 dark:bg-green-950/40"
                              : i === result.selectedIndex && !result.isCorrect
                              ? "bg-red-50 dark:bg-red-950/40"
                              : ""
                            }`}
                        >
                          <span className={`flex-shrink-0 font-bold text-xs
                            ${i === result.question.correctIndex
                              ? "text-green-600"
                              : i === result.selectedIndex && !result.isCorrect
                              ? "text-red-500"
                              : "text-muted-foreground"
                            }`}>
                            {optionLabels[i]}
                          </span>
                          <span className="leading-snug">{opt}</span>
                          {i === result.question.correctIndex && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 ml-auto mt-0.5" />
                          )}
                          {i === result.selectedIndex && !result.isCorrect && (
                            <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 ml-auto mt-0.5" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2.5 border-l-2 border-blue-400">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">해설</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
