"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Errors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const next: Errors = {};
    if (!currentPassword) next.currentPassword = "현재 비밀번호를 입력해주세요";
    if (!newPassword) next.newPassword = "새 비밀번호를 입력해주세요";
    else if (newPassword.length < 8) next.newPassword = "비밀번호는 8자 이상이어야 합니다";
    else if (newPassword === currentPassword)
      next.newPassword = "현재 비밀번호와 다른 비밀번호를 입력해주세요";
    if (!confirmPassword) next.confirmPassword = "비밀번호 확인을 입력해주세요";
    else if (newPassword !== confirmPassword)
      next.confirmPassword = "비밀번호가 일치하지 않습니다";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    // 1. 현재 로그인된 유저 확인
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      setIsLoading(false);
      return;
    }

    // 2. 현재 비밀번호 검증 (재로그인으로 확인)
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (verifyError) {
      setErrors({ currentPassword: "현재 비밀번호가 올바르지 않습니다" });
      setIsLoading(false);
      return;
    }

    // 3. 새 비밀번호로 변경
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("비밀번호 변경 실패", { description: error.message });
    } else {
      toast.success("비밀번호가 변경됐습니다.", {
        description: "다시 로그인해주세요.",
      });
      await supabase.auth.signOut();
      router.push("/login");
    }

    setIsLoading(false);
  };

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const toggle = (field: keyof typeof show) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      {/* 로고 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight">ExamCraft</span>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">비밀번호 변경</CardTitle>
          <CardDescription>새로운 비밀번호를 설정하세요</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* 현재 비밀번호 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="currentPassword">
                현재 비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={show.current ? "text" : "password"}
                  placeholder="현재 비밀번호 입력"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); clearError("currentPassword"); }}
                  className="pl-9 pr-9"
                  aria-invalid={!!errors.currentPassword}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => toggle("current")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword}</p>
              )}
            </div>

            {/* 새 비밀번호 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="newPassword">
                새 비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={show.next ? "text" : "password"}
                  placeholder="8자 이상 입력"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); clearError("newPassword"); }}
                  className="pl-9 pr-9"
                  aria-invalid={!!errors.newPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => toggle("next")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {show.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword}</p>
              )}
            </div>

            {/* 새 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="confirmPassword">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={show.confirm ? "text" : "password"}
                  placeholder="새 비밀번호 재입력"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                  className="pl-9 pr-9"
                  aria-invalid={!!errors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => toggle("confirm")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-9"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              홈으로 돌아가기
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        © 2026 ExamCraft. All rights reserved.
      </p>
    </div>
  );
}
