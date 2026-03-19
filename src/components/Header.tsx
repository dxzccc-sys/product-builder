"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Subject } from "@/lib/mockData";
import { BookOpen } from "lucide-react";

interface HeaderProps {
  selectedSubject: Subject | null;
}

export default function Header({ selectedSubject }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ExamReady</span>
        </div>

        {/* Current Subject */}
        {selectedSubject && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm text-muted-foreground">현재 과목</span>
            <Badge variant="secondary" className="font-medium">
              {selectedSubject.icon} {selectedSubject.name}
            </Badge>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">이준혁</p>
            <p className="text-xs text-muted-foreground">사원</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm dark:bg-blue-900 dark:text-blue-300">
              이준
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
