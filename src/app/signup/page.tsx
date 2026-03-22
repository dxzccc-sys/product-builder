"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Briefcase, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
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

const ROLES = ["사원", "대리", "과장", "차장", "수석", "팀장", "부장"];

type Errors = {
  name?: string;
  role?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = "이름을 입력해주세요";
    if (!role) next.role = "직급을 선택해주세요";
    if (!email) next.email = "이메일을 입력해주세요";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "올바른 이메일 형식이 아닙니다";
    if (!password) next.password = "비밀번호를 입력해주세요";
    else if (password.length < 8) next.password = "비밀번호는 8자 이상이어야 합니다";
    if (!confirmPassword) next.confirmPassword = "비밀번호 확인을 입력해주세요";
    else if (password !== confirmPassword) next.confirmPassword = "비밀번호가 일치하지 않습니다";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast.error("회원가입 실패", { description: error.message });
    } else if (data.user) {
      // profiles 테이블에 직접 삽입
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: name,
        role: role,
      });

      if (profileError) {
        toast.error("프로필 저장 실패", { description: profileError.message });
        setIsLoading(false);
        return;
      }

      toast.success("회원가입 완료!", {
        description: "로그인 페이지로 이동합니다.",
      });
      router.push("/login");
    }

    setIsLoading(false);
  };

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

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
          <CardTitle className="text-lg">회원가입</CardTitle>
          <CardDescription>회사 이메일로 계정을 만드세요</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* 이름 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="name">
                이름
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError("name"); }}
                  className="pl-9"
                  aria-invalid={!!errors.name}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* 직급 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="role">
                직급
              </label>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <select
                  id="role"
                  value={role}
                  onChange={(e) => { setRole(e.target.value); clearError("role"); }}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 appearance-none text-foreground"
                  aria-invalid={!!errors.role}
                >
                  <option value="" disabled>직급 선택</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            </div>

            {/* 이메일 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  className="pl-9"
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상 입력"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  className="pl-9 pr-9"
                  aria-invalid={!!errors.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="confirmPassword">
                비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="비밀번호 재입력"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                  className="pl-9 pr-9"
                  aria-invalid={!!errors.confirmPassword}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
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
