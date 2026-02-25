"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { UserSummary } from "@/types";

type Props = {
  users: UserSummary[];
  selectedUserId?: string;
};

// デフォルトで非表示にする status 値
const HIDDEN_STATUSES = ["入院", "退所"];

export default function UserList({ users, selectedUserId }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // 1. テキスト検索フィルタ
  const searched = users.filter(
    (u) =>
      u.name.includes(query) || (u.building_room ?? "").includes(query)
  );

  // 2. ステータス絞り込み（デフォルト: 入院・退所・空床を非表示）
  const filtered = showAll
    ? searched
    : searched.filter(
        (u) =>
          !HIDDEN_STATUSES.includes(u.status ?? "") &&
          !u.name.includes("空床")
      );

  return (
    <>
      {/* 検索バー */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="利用者を検索..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 表示切り替えトグル */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="flex items-center gap-2 cursor-pointer select-none"
          aria-label={showAll ? "入居中のみ表示に切り替え" : "すべて表示に切り替え"}
        >
          {/* トグルスイッチ */}
          <div
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
              showAll ? "bg-teal-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                showAll ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-xs text-gray-600">
            {showAll ? "すべて表示" : "入居中のみ"}
          </span>
        </button>
      </div>

      {/* 利用者リスト */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            利用者一覧 ({filtered.length}名)
          </p>
        </div>
        <ul>
          {filtered.map((user) => {
            const isActive = user.id === selectedUserId;
            const isHospitalized = user.status === "入院";
            const isDischarge = user.status === "退所";
            const isEmptyBed = user.name.includes("空床");

            return (
              <li key={user.id}>
                <button
                  onClick={() => router.push(`?userId=${user.id}`)}
                  className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-0 ${
                    isActive
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? "bg-blue-500" : "bg-blue-100"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-white" : "text-blue-600"
                        }`}
                      >
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <p
                          className={`text-sm font-medium truncate ${
                            isActive ? "text-blue-700" : "text-gray-900"
                          }`}
                        >
                          {user.name}
                        </p>
                        {/* すべて表示のときだけバッジを表示 */}
                        {showAll && isHospitalized && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium shrink-0 leading-none">
                            入院中
                          </span>
                        )}
                        {showAll && isDischarge && (
                          <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-medium shrink-0 leading-none">
                            退所
                          </span>
                        )}
                        {showAll && isEmptyBed && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded-full font-medium shrink-0 leading-none">
                            空床
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {user.building_room ?? "部屋未設定"}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            {query
              ? "該当する利用者が見つかりません"
              : "利用者データが見つかりません"}
          </div>
        )}
      </div>
    </>
  );
}
