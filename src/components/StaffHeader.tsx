"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getStaffFromCookie, clearStaffCookie } from "@/lib/staffCookie";
import type { StaffSession } from "@/lib/staffCookie";

export default function StaffHeader() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffSession | null>(null);

  useEffect(() => {
    setStaff(getStaffFromCookie());
  }, []);

  function handleLogout() {
    clearStaffCookie();
    router.push("/login");
  }

  if (!staff) return null;

  return (
    <header className="h-10 bg-white border-b border-gray-200 flex items-center justify-end px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          ログイン中：
          <span className="font-medium text-gray-800 ml-1">{staff.name}</span>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          ログアウト
        </button>
      </div>
    </header>
  );
}
