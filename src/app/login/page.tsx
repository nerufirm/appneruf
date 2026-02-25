"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setStaffCookie, getStaffFromCookie } from "@/lib/staffCookie";
import type { Staff } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // すでにログイン済みなら / にリダイレクト
    if (getStaffFromCookie()) {
      router.replace("/");
      return;
    }

    supabase
      .from("staff")
      .select("id, name, department")
      .order("id", { ascending: true })
      .then(({ data }) => {
        setStaffList(data ?? []);
        setLoading(false);
      });
  }, [router]);

  function handleLogin() {
    const staff = staffList.find((s) => s.id === selectedId);
    if (!staff) return;
    setSubmitting(true);
    setStaffCookie({ id: staff.id, name: staff.name });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 mb-4">
            <svg
              className="w-7 h-7 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">AppSheetto</h1>
          <p className="text-sm text-gray-500 mt-1">担当スタッフを選択してください</p>
        </div>

        {/* フォーム */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              スタッフ名
            </label>
            {loading ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
              >
                <option value="">選択してください</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.department ? ` (${s.department})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedId || submitting}
            className="w-full py-2.5 px-4 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "ログイン中..." : "ログイン"}
          </button>
        </div>
      </div>
    </div>
  );
}
