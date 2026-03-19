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
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (subjectName: string) => void;
}

type UploadStep = "idle" | "selected" | "uploading" | "done";

export default function UploadModal({ open, onOpenChange, onComplete }: UploadModalProps) {
  const [step, setStep] = useState<UploadStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".pdf")) return;
    setFileName(file.name);
    setStep("selected");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleUpload = () => {
    if (!subjectName.trim() || step !== "selected") return;
    setStep("uploading");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep("done");
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const handleComplete = () => {
    onComplete(subjectName);
    handleReset();
  };

  const handleReset = () => {
    setStep("idle");
    setFileName("");
    setSubjectName("");
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleReset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">새 과목 추가</DialogTitle>
        </DialogHeader>

        {step !== "done" ? (
          <div className="space-y-4 py-2">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => step === "idle" && inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200
                ${dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : ""}
                ${step === "idle" ? "cursor-pointer hover:border-blue-400 hover:bg-muted/50 border-muted-foreground/25" : ""}
                ${step === "selected" || step === "uploading" ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 cursor-default" : ""}
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

              {(step === "selected" || step === "uploading") && (
                <>
                  <div className="rounded-full bg-blue-100 p-3 mb-3 dark:bg-blue-900">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-medium text-sm text-center break-all px-2">{fileName}</p>
                  {step === "selected" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setStep("idle"); setFileName(""); }}
                      className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" /> 파일 변경
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Subject name input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">과목명</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="예: 정보처리기사, 클라우드 아키텍처"
                disabled={step === "uploading"}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Progress bar */}
            {step === "uploading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>AI 분석 중...</span>
                  <span>{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  PDF 내용을 분석하고 학습 자료를 생성하고 있습니다
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Done state */
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold">분석 완료!</p>
            <p className="text-sm text-muted-foreground text-center">
              <span className="font-medium text-foreground">{subjectName}</span> 과목이
              추가되었습니다.
              <br />
              이제 학습을 시작할 수 있어요.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "done" ? (
            <Button onClick={handleComplete} className="w-full bg-blue-600 hover:bg-blue-700">
              학습 시작하기
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset} disabled={step === "uploading"}>
                취소
              </Button>
              <Button
                onClick={handleUpload}
                disabled={step !== "selected" || !subjectName.trim() || step === ("uploading" as UploadStep)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {step === "uploading" ? "분석 중..." : "업로드 및 분석 시작"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
