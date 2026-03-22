"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Subject } from "@/lib/mockData";
import { BookOpen, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  selectedSubject: Subject | null;
}

interface Profile {
  name: string;
  role: string;
}

export default function Header({ selectedSubject }: HeaderProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = profile?.name?.slice(0, 2) ?? "??";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ExamCraft</span>
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
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg outline-none">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{profile?.name ?? "..."}</p>
              <p className="text-xs text-muted-foreground">{profile?.role ?? ""}</p>
            </div>
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent transition-all hover:ring-blue-400">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm dark:bg-blue-900 dark:text-blue-300">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
