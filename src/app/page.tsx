"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SubjectCard from "@/components/SubjectCard";
import UploadModal from "@/components/UploadModal";
import StudyToolsGrid from "@/components/StudyToolsGrid";
import StatsBar from "@/components/StatsBar";
import { mockSubjects, Subject } from "@/lib/mockData";
import { Plus } from "lucide-react";

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleUploadComplete = (subjectName: string) => {
    const newSubject: Subject = {
      id: `subject-${Date.now()}`,
      name: subjectName,
      description: "새로 추가된 과목입니다",
      progress: 0,
      lastStudied: new Date().toISOString().split("T")[0],
      totalChapters: 0,
      completedChapters: 0,
      color: "blue",
      icon: "📚",
    };
    setSubjects((prev) => [...prev, newSubject]);
    setSelectedSubject(newSubject);
    toast.success(`"${subjectName}" 과목이 추가되었습니다!`, {
      description: "PDF 분석이 완료되어 학습을 시작할 수 있습니다.",
    });
  };

  const handleToolSelect = (toolId: string) => {
    if (toolId === "quiz") {
      toast.info("기출문제 생성 기능은 2단계에서 구현됩니다.", {
        description: "현재 프로토타입의 1단계입니다.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header selectedSubject={selectedSubject} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">

        {/* Stats Bar */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">오늘의 학습 현황</h2>
          <StatsBar />
        </section>

        {/* Subject Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">내 과목</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                과목을 선택해 학습을 시작하세요
              </p>
            </div>
            <Button
              onClick={() => setUploadOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              새 과목 추가
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isSelected={selectedSubject?.id === subject.id}
                onSelect={setSelectedSubject}
              />
            ))}
          </div>
        </section>

        {/* Study Tools */}
        {selectedSubject && (
          <section>
            <div className="border-t pt-8">
              <StudyToolsGrid
                subject={selectedSubject}
                onToolSelect={handleToolSelect}
              />
            </div>
          </section>
        )}

        {/* Empty state when no subject selected */}
        {!selectedSubject && (
          <section className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">👆</div>
            <p className="text-muted-foreground text-sm">
              위에서 과목을 선택하면 학습 도구가 표시됩니다
            </p>
          </section>
        )}
      </main>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onComplete={handleUploadComplete}
      />
    </div>
  );
}
