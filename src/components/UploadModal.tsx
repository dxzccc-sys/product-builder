"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { extractTextFromPDF } from "@/lib/pdf";
import type { Subject } from "@/lib/mockData";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (subject: Subject) => void;
}

type UploadStep = "idle" | "selected" | "processing" | "done" | "error";

interface ProgressState {
  value: number;
  label: string;
}

const ICON_OPTIONS = ["📚", "☁️", "🔒", "📈", "💻", "🧪", "⚙️", "📊", "🎯", "🏆"];
const COLOR_OPTIONS = ["blue", "orange", "green"] as const;

export default function UploadModal({ open, onOpenChange, onComplete }: UploadModalProps) {
  const [step, setStep] = useState<UploadStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📚");
  const [selectedColor, setSelectedColor] = useState<"blue" | "orange" | "green">("blue");
  const [progress, setProgress] = useState<ProgressState>({ value: 0, label: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<{ total: number; pass1: number; pass2: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) return;
    setFile(f);
    setStep("selected");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const setProgressStep = (value: number, label: string) => {
    setProgress({ value, label });
  };

  const handleUpload = async () => {
    if (!file || !subjectName.trim()) return;
    setStep("processing");
    setErrorMsg("");

    try {
      // Step 1: 인증 확인
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다");

      setProgressStep(5, "PDF 텍스트 추출 중...");

      // Step 2: PDF 텍스트 추출
      const extractedText = await extractTextFromPDF(file);
      if (!extractedText || extractedText.length < 50) {
        throw new Error("PDF에서 텍스트를 추출할 수 없습니다. 텍스트 기반 PDF인지 확인해주세요.");
      }

      setProgressStep(20, "과목 정보 저장 중...");

      // Step 3: subjects 테이블에 과목 생성
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .insert({
          user_id: user.id,
          name: subjectName.trim(),
          description: `${file.name} 기반으로 생성된 학습 자료`,
          icon: selectedIcon,
          color: selectedColor,
        })
        .select()
        .single();

      if (subjectError) throw new Error(`과목 저장 오류: ${subjectError.message}`);

      setProgressStep(30, "PDF 파일 업로드 중...");

      // Step 4: Supabase Storage에 PDF 업로드
      // 특수문자·한글·공백 등 Storage에서 허용되지 않는 문자 제거
      const safeFileName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_+/g, "_");
      const filePath = `${user.id}/${subjectData.id}/${Date.now()}_${safeFileName}`;
      const { error: storageError } = await supabase.storage
        .from("pdfs")
        .upload(filePath, file, { contentType: "application/pdf" });

      if (storageError) throw new Error(`파일 업로드 오류: ${storageError.message}`);

      setProgressStep(40, "문서 정보 저장 중...");

      // Step 5: documents 테이블에 문서 생성
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          subject_id: subjectData.id,
          user_id: user.id,
          name: file.name,
          file_path: filePath,
          extracted_text: extractedText,
          status: "processing",
        })
        .select()
        .single();

      if (docError) throw new Error(`문서 저장 오류: ${docError.message}`);

      setProgressStep(50, "1차 문제 생성 중... (Pass 1)");

      // Step 6: Edge Function 직접 fetch 호출 (에러 본문 명확히 확인)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("세션이 만료되었습니다");

      const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-questions`;
      const fnRes = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          document_id: docData.id,
          subject_id: subjectData.id,
          subject_name: subjectName.trim(),
          extracted_text: extractedText,
        }),
      });

      const fnBody = await fnRes.json();
      console.log("[EdgeFn] status:", fnRes.status, "body:", fnBody);

      // Pass 1 완료 시점에 진행률 업데이트
      setProgressStep(75, "2차 심화 문제 생성 중... (Pass 2)");

      if (!fnRes.ok) {
        throw new Error(`문제 생성 오류: ${fnBody.error ?? fnRes.statusText}`);
      }

      const genResult = fnBody as { success: boolean; total: number; pass1: number; pass2: number };
      if (!genResult.success) {
        throw new Error("문제 생성에 실패했습니다");
      }

      setProgressStep(100, "완료!");
      setResult(genResult);

      // subjects에서 최신 데이터 재조회
      setStep("done");

      // onComplete에 Subject 형태로 전달
      const newSubject: Subject = {
        id: subjectData.id,
        name: subjectData.name,
        description: subjectData.description,
        progress: 0,
        lastStudied: subjectData.created_at,
        totalChapters: genResult.total,
        completedChapters: 0,
        color: subjectData.color,
        icon: subjectData.icon,
      };
      onComplete(newSubject);

    } catch (err) {
      console.error("업로드 오류:", err);
      setErrorMsg(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다");
      setStep("error");
    }
  };

  const handleReset = () => {
    setStep("idle");
    setFile(null);
    setSubjectName("");
    setSelectedIcon("📚");
    setSelectedColor("blue");
    setProgress({ value: 0, label: "" });
    setErrorMsg("");
    setResult(null);
    onOpenChange(false);
  };

  const colorBorderMap: Record<string, string> = {
    blue: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    orange: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
    green: "border-green-500 bg-green-50 dark:bg-green-950/30",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && step !== "processing") handleReset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">새 과목 추가</DialogTitle>
        </DialogHeader>

        {/* ── Done ── */}
        {step === "done" && result && (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold">문제 생성 완료!</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{subjectName}</span> 과목에
            </p>
            <div className="flex gap-3 text-sm">
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xl font-bold text-blue-600">{result.total}</p>
                <p className="text-xs text-muted-foreground">총 문제</p>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xl font-bold text-green-600">{result.pass1}</p>
                <p className="text-xs text-muted-foreground">1차 생성</p>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2 text-center">
                <p className="text-xl font-bold text-orange-600">{result.pass2}</p>
                <p className="text-xs text-muted-foreground">2차 심화</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">이제 학습을 시작할 수 있어요!</p>
          </div>
        )}

        {/* ── Error ── */}
        {step === "error" && (
          <div className="flex flex-col items-center py-6 gap-3 text-center">
            <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-base font-semibold text-red-600">오류가 발생했습니다</p>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
        )}

        {/* ── Form (idle / selected / processing) ── */}
        {(step === "idle" || step === "selected" || step === "processing") && (
          <div className="space-y-4 py-2">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => step === "idle" && inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200
                ${dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : ""}
                ${step === "idle" ? "cursor-pointer hover:border-blue-400 hover:bg-muted/50 border-muted-foreground/25" : ""}
                ${step === "selected" ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 cursor-default" : ""}
                ${step === "processing" ? "border-muted-foreground/20 opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {step === "idle" && (
                <>
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">PDF 파일을 드래그하거나 클릭하여 선택</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF 파일만 지원 (최대 50MB)</p>
                </>
              )}
              {(step === "selected" || step === "processing") && file && (
                <>
                  <div className="rounded-full bg-blue-100 p-3 mb-3 dark:bg-blue-900">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-medium text-sm text-center break-all px-2">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {step === "selected" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setStep("idle"); setFile(null); }}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" /> 파일 변경
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Subject name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">과목명</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="예: 정보처리기사, 클라우드 아키텍처"
                disabled={step === "processing"}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Icon & Color picker */}
            {step !== "processing" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">아이콘</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setSelectedIcon(icon)}
                        className={`text-xl rounded-lg p-1.5 transition-all border-2 ${
                          selectedIcon === icon
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-transparent hover:border-muted-foreground/30"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">색상</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-full w-6 h-6 border-2 transition-all ${
                          color === "blue" ? "bg-blue-500" : color === "orange" ? "bg-orange-500" : "bg-green-500"
                        } ${selectedColor === color ? "border-foreground scale-110" : "border-transparent"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar (processing) */}
            {step === "processing" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {progress.label}
                  </span>
                  <span>{Math.round(progress.value)}%</span>
                </div>
                <Progress value={progress.value} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span className={progress.value >= 5 ? "text-blue-600 font-medium" : ""}>텍스트 추출</span>
                  <span className={progress.value >= 40 ? "text-blue-600 font-medium" : ""}>파일 저장</span>
                  <span className={progress.value >= 50 ? "text-blue-600 font-medium" : ""}>1차 생성</span>
                  <span className={progress.value >= 75 ? "text-blue-600 font-medium" : ""}>2차 심화</span>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "done" && (
            <Button onClick={handleReset} className="w-full bg-blue-600 hover:bg-blue-700">
              학습 시작하기
            </Button>
          )}
          {step === "error" && (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                닫기
              </Button>
              <Button onClick={() => setStep("selected")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                다시 시도
              </Button>
            </div>
          )}
          {(step === "idle" || step === "selected" || step === "processing") && (
            <div className="flex w-full gap-2">
              <Button variant="outline" onClick={handleReset} disabled={step === "processing"}>
                취소
              </Button>
              <Button
                onClick={handleUpload}
                disabled={step !== "selected" || !subjectName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {step === "processing" ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</>
                ) : (
                  "업로드 및 문제 생성"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
