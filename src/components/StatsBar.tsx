"use client";

import { mockStats } from "@/lib/mockData";
import { Flame, Target, CheckCircle2 } from "lucide-react";

export default function StatsBar() {
  const { todayQuestions, totalCorrectRate, streakDays } = mockStats;

  const stats = [
    {
      icon: CheckCircle2,
      label: "오늘 푼 문제",
      value: `${todayQuestions}문제`,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      icon: Target,
      label: "전체 정답률",
      value: `${totalCorrectRate}%`,
      iconColor: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/50",
    },
    {
      icon: Flame,
      label: "연속 학습일",
      value: `${streakDays}일`,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`flex flex-col sm:flex-row items-center sm:gap-3 rounded-xl p-3 sm:p-4 ${stat.bgColor}`}
          >
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="text-center sm:text-left mt-1 sm:mt-0">
              <p className="text-base sm:text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
