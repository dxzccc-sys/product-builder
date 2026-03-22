"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Subject } from "@/lib/mockData";
import { Calendar, ChevronRight } from "lucide-react";

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onSelect: (subject: Subject) => void;
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
  orange: "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800",
  green: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
};

const selectedColorMap: Record<string, string> = {
  blue: "ring-2 ring-blue-500 border-blue-400",
  orange: "ring-2 ring-orange-500 border-orange-400",
  green: "ring-2 ring-green-500 border-green-400",
};

const progressColorMap: Record<string, string> = {
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
};

const badgeColorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  return `${diffDays}일 전`;
}

export default function SubjectCard({ subject, isSelected, onSelect }: SubjectCardProps) {
  return (
    <Card
      onClick={() => onSelect(subject)}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-2
        ${colorMap[subject.color] ?? ""}
        ${isSelected ? selectedColorMap[subject.color] ?? "" : ""}
      `}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{subject.icon}</span>
            <div>
              <h3 className="font-semibold text-base">{subject.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {subject.description}
              </p>
            </div>
          </div>
          <ChevronRight
            className={`h-4 w-4 mt-1 transition-colors ${
              isSelected ? "text-foreground" : "text-muted-foreground"
            }`}
          />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">학습 진도</span>
            <span className="font-semibold">{subject.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColorMap[subject.color]}`}
              style={{ width: `${subject.progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(subject.lastStudied)}</span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeColorMap[subject.color]}`}
          >
            {subject.totalChapters > 0
              ? subject.completedChapters > 0
                ? `${subject.completedChapters}/${subject.totalChapters} 챕터`
                : `${subject.totalChapters}문제`
              : "문제 없음"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
