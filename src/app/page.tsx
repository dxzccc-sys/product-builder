"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import SubjectCard from "@/components/SubjectCard";
import UploadModal from "@/components/UploadModal";
import StudyToolsGrid from "@/components/StudyToolsGrid";
import StatsBar from "@/components/StatsBar";
import { Subject } from "@/lib/mockData";
import { supabase, fetchUserSubjects, DbSubject } from "@/lib/supabase";
import { Plus, BookOpen, Loader2 } from "lucide-react";

function dbSubjectToSubject(db: DbSubject): Subject {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    progress: 0,
    lastStudied: db.created_at,
    totalChapters: db.question_count ?? 0,
    completedChapters: 0,
    color: db.color,
    icon: db.icon,
  };
}

export default function HomePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 인증 확인 + 과목 로드
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      await loadSubjects();
    };
    init();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const dbSubjects = await fetchUserSubjects();
      setSubjects(dbSubjects.map(dbSubjectToSubject));
    } catch (err) {
      console.error("과목 로드 실패:", err);
      toast.error("과목 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
    setSelectedSubject(newSubject);
    toast.success(`"${newSubject.name}" 과목이 추가되었습니다!`, {
      description: `총 ${newSubject.totalChapters}문제가 생성되어 학습을 시작할 수 있습니다.`,
    });
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

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : subjects.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-4 dark:bg-blue-950">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold">아직 과목이 없습니다</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                PDF 자료를 업로드하면 AI가 문제를 자동 생성합니다
              </p>
              <Button
                onClick={() => setUploadOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                첫 번째 과목 추가하기
              </Button>
            </div>
          ) : (
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
          )}
        </section>

        {/* Study Tools */}
        {selectedSubject && (
          <section className="border-t pt-8">
            <StudyToolsGrid
              subject={selectedSubject}
              onToolSelect={() => {}}
            />
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
