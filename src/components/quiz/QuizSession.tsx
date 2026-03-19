"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Question } from "@/lib/mockData";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Flag,
} from "lucide-react";

interface QuizSessionProps {
  questions: Question[];
  onFinish: (results: QuestionResult[]) => void;
}

export interface QuestionResult {
  question: Question;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

const difficultyColor: Record<string, string> = {
  하: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  중: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  상: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const optionLabels = ["①", "②", "③", "④"];

export default function QuizSession({ questions, onFinish }: QuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const current = questions[currentIndex];
  const progress = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);
  };

  const handleNext = () => {
    const result: QuestionResult = {
      question: current,
      selectedIndex,
      isCorrect: selectedIndex === current.correctIndex,
      timeSpent: Date.now() - questionStartTime,
    };
    const newResults = [...results, result];

    if (isLast) {
      onFinish(newResults);
    } else {
      setResults(newResults);
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setAnswered(false);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSkip = () => {
    const result: QuestionResult = {
      question: current,
      selectedIndex: null,
      isCorrect: false,
      timeSpent: Date.now() - questionStartTime,
    };
    const newResults = [...results, result];
    if (isLast) {
      onFinish(newResults);
    } else {
      setResults(newResults);
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setAnswered(false);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    }
  };

  const getOptionStyle = (index: number) => {
    if (!answered) {
      return "border-border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer";
    }
    if (index === current.correctIndex) {
      return "border-green-500 bg-green-50 dark:bg-green-950/40";
    }
    if (index === selectedIndex && selectedIndex !== current.correctIndex) {
      return "border-red-400 bg-red-50 dark:bg-red-950/40";
    }
    return "border-border opacity-50";
  };

  const getOptionLabelStyle = (index: number) => {
    if (!answered) return "bg-muted text-muted-foreground";
    if (index === current.correctIndex) return "bg-green-500 text-white";
    if (index === selectedIndex && selectedIndex !== current.correctIndex)
      return "bg-red-400 text-white";
    return "bg-muted text-muted-foreground";
  };

  const isCorrect = answered && selectedIndex === current.correctIndex;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {currentIndex + 1} / {questions.length} 문제
          </span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">
              정답 {results.filter((r) => r.isCorrect).length}개
            </span>
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Flag className="h-3 w-3" />
              건너뛰기
            </button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {current.chapterId.replace(/-\d+$/, "").replace("cloud", "클라우드").replace("security", "보안").replace("finance", "금융")} Ch.{current.chapterId.split("-").pop()}
          </Badge>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor[current.difficulty]}`}>
            {current.difficulty === "하" ? "쉬움" : current.difficulty === "중" ? "보통" : "어려움"}
          </span>
        </div>

        {/* Question text */}
        <p className="text-base font-medium leading-relaxed">{current.text}</p>

        {/* Options */}
        <div className="space-y-2.5">
          {current.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={`w-full flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150 ${getOptionStyle(index)}`}
            >
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${getOptionLabelStyle(index)}`}
              >
                {optionLabels[index]}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">{option}</span>

              {answered && index === current.correctIndex && (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 ml-auto mt-0.5" />
              )}
              {answered && index === selectedIndex && selectedIndex !== current.correctIndex && (
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 ml-auto mt-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* Feedback banner */}
        {answered && (
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 transition-all ${
              isCorrect
                ? "bg-green-50 border border-green-200 dark:bg-green-950/40 dark:border-green-800"
                : "bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            )}
            <span
              className={`text-sm font-semibold ${
                isCorrect ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isCorrect ? "정답입니다!" : `오답 — 정답은 ${optionLabels[current.correctIndex]}번입니다`}
            </span>
          </div>
        )}

        {/* Explanation */}
        {answered && (
          <div>
            <button
              onClick={() => setShowExplanation((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {showExplanation ? "해설 접기" : "해설 보기"}
            </button>
            {showExplanation && (
              <div className="mt-2 rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground leading-relaxed border-l-2 border-blue-400">
                {current.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-end gap-2">
        {answered && (
          <Button
            onClick={handleNext}
            className="gap-2 bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isLast ? "결과 보기" : "다음 문제"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
