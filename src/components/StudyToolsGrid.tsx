"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Subject } from "@/lib/mockData";
import {
  FileQuestion,
  BookText,
  BarChart3,
  MessageSquareText,
  ArrowRight,
} from "lucide-react";

interface StudyToolsGridProps {
  subject: Subject;
  onToolSelect: (tool: string) => void;
}

const tools = [
  {
    id: "quiz",
    icon: FileQuestion,
    title: "기출문제 생성",
    description: "AI가 핵심 내용을 분석해 시험에 나올 법한 문제를 생성합니다",
    badge: "인기",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950",
    action: "문제 풀기 시작",
    available: true,
  },
  {
    id: "summary",
    icon: BookText,
    title: "목차별 요약",
    description: "챕터별 핵심 내용 요약과 시험 출제 포인트를 확인합니다",
    badge: "Coming soon",
    badgeColor: "bg-muted text-muted-foreground",
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-50 dark:bg-green-950",
    action: "요약 보기",
    available: false,
  },
  {
    id: "analysis",
    icon: BarChart3,
    title: "약점 분석 대시보드",
    description: "챕터별 정답률과 약점을 분석해 효율적인 학습 방향을 제시합니다",
    badge: "Coming soon",
    badgeColor: "bg-muted text-muted-foreground",
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 dark:bg-orange-950",
    action: "대시보드 보기",
    available: false,
  },
  {
    id: "chat",
    icon: MessageSquareText,
    title: "AI 질문하기",
    description: "업로드한 자료를 기반으로 궁금한 내용을 AI에게 자유롭게 질문합니다",
    badge: "Coming soon",
    badgeColor: "bg-muted text-muted-foreground",
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 dark:bg-purple-950",
    action: "질문하기",
    available: false,
  },
];

export default function StudyToolsGrid({ subject, onToolSelect }: StudyToolsGridProps) {
  const router = useRouter();

  const handleTool = (toolId: string) => {
    if (toolId === "quiz") {
      router.push(`/quiz?subject=${subject.id}`);
    } else {
      onToolSelect(toolId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">
          {subject.icon} {subject.name} 학습 도구
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          원하는 학습 방식을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              className={`transition-all duration-200 ${
                tool.available
                  ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                  : "opacity-60"
              }`}
              onClick={() => tool.available && handleTool(tool.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-2.5 flex-shrink-0 ${tool.iconBg}`}>
                    <Icon className={`h-6 w-6 ${tool.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{tool.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {tool.available && (
                  <Button
                    size="sm"
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 gap-1.5"
                    onClick={(e) => { e.stopPropagation(); handleTool(tool.id); }}
                  >
                    {tool.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
